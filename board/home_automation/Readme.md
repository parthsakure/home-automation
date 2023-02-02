#Steps

1. follow https://randomnerdtutorials.com/install-esp32-filesystem-uploader-arduino-ide/ this link for adding support for files upload on esp device
2. Open Arduino IDE (not 2.0) open .ino file from this project
3. Go to tools & click on sketch Data upload
4. Now dump the code into your esp

#Working
1. If you're turing it on for the first time then esp is in Access Point mode
2. connect to the board using wifi.
3. A page will pop up for wifi credentials (ssid, password) & mDNS name for board to access it after successful connection to your home wifi
4. After submit the board will restart
5. now open browser on your device & go to "<mDNS_Name>.local"
6. Enter Device Id from the device created in frontend App
7. Now your board is fetching information from the Django server
