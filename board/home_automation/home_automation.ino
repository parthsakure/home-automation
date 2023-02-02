#include "SPIFFS.h"
#include <DNSServer.h>
#include <ESPmDNS.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include "ESPAsyncWebServer.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>


String ServerURL = "http://192.168.0.103:8000/api/device/";

const String data_path = "/data.json";
const String auth_path = "/login_deatails.json";
const String wifi_path = "/wifi_deatails.json";

const int PORTS[] = {
  0,    //GPIO pin for port 0
  1,    //GPIO pin for port 1
  2,    //GPIO pin for port 2
  3,    //GPIO pin for port 3
  4,    //GPIO pin for port 4
  5,    //GPIO pin for port 5
  6,    //GPIO pin for port 6
  7,    //GPIO pin for port 7
  8,    //GPIO pin for port 8
  9,    //GPIO pin for port 9
};

const String hostname = "espdev";

StaticJsonDocument<200> wifiCredsJSON;
StaticJsonDocument<200> authJSON;
StaticJsonDocument<256> portsJSON;



DNSServer dnsServer;
AsyncWebServer server(80);

class CaptiveRequestHandler : public AsyncWebHandler {
public:
  CaptiveRequestHandler() {}
  virtual ~CaptiveRequestHandler() {}

  bool canHandle(AsyncWebServerRequest *request){
    //request->addInterestingHeader("ANY");
    return true;
  }

  void handleRequest(AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/index.html" ,"text/html");
  }
};

void setupServer(){

  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/style.css", "text/css");
  });
    
  server.on("/send", HTTP_POST, [] (AsyncWebServerRequest *req) {
      String pass="";
      String ssid="";
      String mDNS = "";
      int params= req->params();
      for (int i = 0; i < params; i++) {
        AsyncWebParameter* p = req->getParam(i);
        Serial.printf("POST[%s]: %s\n",p->name().c_str(),p->value().c_str());

        if(String(p->name().c_str()) == "ssid"){
          ssid = p->value().c_str();
        }
        else if(String(p->name().c_str()) == "password"){
          pass = p->value().c_str();
        }
        else if(String(p->name().c_str()) == "mdns"){
          mDNS = p->value().c_str();
        }

      }
      Serial.printf("SSID: %s\nPassword: %s\nmDNS: %s\n",ssid.c_str(),pass.c_str(),mDNS.c_str());
      String response = "<h1>Trying to connect to " + ssid + " </h1><p>Device Restarting in 5 Seconds..</p>";
      req->send(200, "text/html", response);

      File f = SPIFFS.open(wifi_path, FILE_WRITE);
      
      if(!f){
        Serial.println("Error Creating wifi file storage Credentials!");
      }
      else{
        Serial.println("Saving Credentials...");
        deserializeJson(wifiCredsJSON, "");
        wifiCredsJSON["ssid"] = ssid;
        wifiCredsJSON["password"] = pass;
        wifiCredsJSON["mDNS"] = mDNS;
        String wifi;
        serializeJson(wifiCredsJSON,wifi);
        Serial.println(wifi);
        if(f.print(wifi)){
          Serial.println("Wifi Credentails Are saved!");
        }
        else{
          Serial.println("Error saving wifi Credentials!");
        }
        f.close();
        delay(5000);
        ESP.restart();
      }
  });

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
      request->send(SPIFFS, "/auth.html" ,"text/html"); 
      Serial.println("Client Connected");
  });

  server.on("/token", HTTP_POST, [](AsyncWebServerRequest *req){
    String id = "";
    String pass = "";
    int params = req->params();
    for(int i=0;i<params;i++){
        AsyncWebParameter* p = req->getParam(i);
        if(String(p->name().c_str()) == "device-id"){
          id = p->value().c_str();
        }
        // if(String(p->name().c_str()) == "password"){
        //   pass = p->value().c_str();
        // }
    }
    File f= SPIFFS.open(auth_path,FILE_WRITE);
    if(!f){
      Serial.println("Error Creating Authentication file!");
    }
    else{
      Serial.println("Saving Authentication Token...");
      deserializeJson(authJSON,"");
      String auth;
      authJSON["id"] = id;
      // authJSON["password"] = pass;
      serializeJson(authJSON,auth);
      Serial.print("Authorization Token: ");Serial.println(auth);
      if(f.print(auth)){
        Serial.println("Token Saved!");
      }
      else{
        Serial.println("Error Writing Token in file!!");
      }
    }
    f.close();
    req->send(200, "text/html","<h1>Device ID Saved!</h1>");
  });
}

void createServer(){

  Serial.println("Wifi credentials not found.\n Creating Server...");
  Serial.println("Starting WiFi Access Point...");
  WiFi.mode(WIFI_AP);
  WiFi.softAP("ESP-Device");
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);

  Serial.println("Setting Server...");
  setupServer();
  
  Serial.println("Starting DNS Server...");
  dnsServer.start(53, "*" ,IP);

  server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER);

  server.begin();
  Serial.println("Server Started!");

}


void getStates(){
  File authfile = SPIFFS.open(auth_path);
  String data = "";
  while(authfile.available()){
    data = authfile.readString();
  }
  deserializeJson(authJSON,data);
  const char* devid = authJSON["id"];
  const char* pass = authJSON["password"];
  WiFiClient client;
  HTTPClient http;

  http.begin(client, ServerURL+"states/"+devid+"/");
  
  http.addHeader("Content-type","application/json");

  int resCode = http.GET();

  Serial.print("Response: ");
  // Serial.println(resCode);
  if(resCode ==200){
    String res = http.getString();
    Serial.println(res);
    deserializeJson(portsJSON, res);
    File f = SPIFFS.open(data_path, FILE_WRITE);
    if(f.print(res)){
      Serial.println("States Saved!");
    }
    else{
      Serial.println("Unable to save States");
    }
    f.close();

  }

  http.end();
}

void setPorts(){
  File f = SPIFFS.open(data_path);
  String data = "";
  while(f.available()){
    data = f.readString();
  }
  deserializeJson(portsJSON,data);
  for(int i=0;i<10;i++){
    // digitalWrite(PORTS[i],(bool) portsJSON["states"][String(i)]);
    Serial.printf("[%d]: %d\t",PORTS[i], (bool)portsJSON["states"][String(i)]);
  }
  Serial.println();
}

void setup() {
 
  Serial.begin(115200);
  delay(1000);
  if (!SPIFFS.begin(true)) {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
  
  File wificredfile = SPIFFS.open(wifi_path);
  bool f= false;
  String data = "";
  if(!wificredfile){
    f=true;
  }
  else{
    while(wificredfile.available()){
      data=wificredfile.readString();
    }
  }
  wificredfile.close();
  if(!f){
    DeserializationError error = deserializeJson(wifiCredsJSON, data);

    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      f=true;
    }
    if(!f){
      const char* ssid = wifiCredsJSON["ssid"]; 
      const char* password = wifiCredsJSON["password"]; 
      const char* mdns = wifiCredsJSON["mDNS"]; 

      // WiFi.setHostname(hostname.c_str());
      WiFi.begin(ssid,password);
      Serial.printf("Connecting to %s.",ssid);
      int c=0;

      while(!WiFi.isConnected()){
        Serial.print(".");
        delay(500);
        c++;
        if(c>20){
          Serial.println("Failed to Connect..");
          f=true;
          break;
        }
      }
      if(WiFi.isConnected()){
        Serial.printf("Connected to %s !\n",ssid);
        Serial.print("Local IP Address: ");Serial.println(WiFi.localIP());
        if(!MDNS.begin(mdns)) {
          Serial.println("Error starting mDNS");
        }
        Serial.print("HostName: ");Serial.println(mdns);
        setupServer();
        server.begin();
      }
    }
  }
  if(f || !WiFi.isConnected()){
    createServer();
  }
}
 
void loop() {
  dnsServer.processNextRequest();
  if(WiFi.isConnected()){
    getStates();
    setPorts();
  }
  delay(1000);
}

