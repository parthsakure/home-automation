from rest_framework.response import Response
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rooms.models import User, Room, Home, Light,Device
from django.contrib.auth import authenticate
from .serializers import HomeSerializer,UserSerializer,RoomSerializer,LightSerializer,DeviceSerializer


@api_view(['POST'])
def loginUser(req):
    username = req.data.get('username')
    password = req.data.get('password')
    try:
        user = User.objects.get(username=username)
    except:
        return Response({'message': 'user does not exist', 'type':'error'},status=404)

    user = authenticate(req, username=username, password=password)

    if user is not None:
        Token.objects.filter(user_id=user.id).delete()
        token = Token.objects.create(user=user)
        token.save()
        return Response({'token':token.key,'user_id':user.id},status=200)
    else:
        return Response({'message': 'Invalid Credentials', 'type':'error'},status=400)

@api_view(["GET"])
def logoutUser(req):
    Token.objects.filter(key=req.headers.get('Authorization')).delete()
    return Response({'message':"logged Out Successfully"}, status=200)
    
@api_view(['POST'])
def registerUser(req):

    username = req.data['username']
    pass1 = req.data['password1']
    pass2 = req.data['password2']
    name = req.data['name']
    try:
        user = User.objects.create_user(
            name=name,
            username=username,
            password = pass1,
        )
        token = Token.objects.create(user=user)
        token.save()
    except Exception as e:

        return Response({'message':e}, status=400)

    return Response({"message": "Account Created!",'token':token.key,'user_id': user.id},status=200)

@api_view(["GET"])
def getRequests(req):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)

    homes = Home.objects.filter(owner=user)
    reshomes= []
    for home in homes:
        obj = {}
        obj['name'] = home.name
        obj['id'] = home.id
        obj['requests'] = []
        for u in home.requests.all():
            obj['requests'].append(UserSerializer(u,many=False).data)

        reshomes.append(obj)
    return Response({'requests':reshomes},status=200)
    




@api_view(['GET'])
def getHomes(req):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    
    homes = Home.objects.filter(homies=user)
    homes = HomeSerializer(homes,many=True).data
    for home in homes:
        rooms= RoomSerializer([x for x in Room.objects.filter(home=home['id'])],many=True).data
        for room in rooms:
            if room['device']:
                room['device'] = DeviceSerializer(Device.objects.get(id=room['device']),many=False).data
        home['rooms'] = rooms
    devices = user.device_set.all()
    devices = DeviceSerializer(devices, many=True)

    return Response({'homes':homes,"devices":devices.data},status=200)

@api_view(["GET"])
def getLights(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)

    homes = Home.objects.filter(homies=user)
    room = Room.objects.get(id=pk)

    rooms = {}
    if room.home not in homes:
        return Response({"message": "Not Accessible"},status=401)
    
    for home in homes:
        rooms[home.id] = home.room_set.all()

    homes =HomeSerializer(homes,many=True)
    for home in homes.data:
        home['rooms'] = RoomSerializer(rooms.get(home.get('id')),many=True).data

    lights = room.light_set.all()
    bookedports = set([x.port for x in lights])
    availableports = set(range(0,10))
    availableports = availableports.difference(bookedports)
    lightsSerialised = LightSerializer(lights, many=True)
    return Response({"homes": homes.data, 'lights':lightsSerialised.data, 'owner': room.home.owner.id, 'available_ports': availableports}, status=200)



@api_view(["GET"])
def setLightState(req,pk,state):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    light = Light.objects.get(id=pk)
    if user.id in light.room.home.homies.all():
        return Response({'message': "You Don't Belong to this Home"}, status=401)
    if state==0:
        light.state = False
    else:
        light.state = True
    light.save()
    lights = light.room.light_set.all()
    return Response({'lights': LightSerializer(lights,many=True).data},status=200)



@api_view(["GET"])
def getHome(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    home = Home.objects.get(id=pk)
    if(home.owner == user):
        return Response({'home':HomeSerializer(home,many=False).data},status=200)
    return Response({'message':"You Are Not Owner"},status=401)

@api_view(["GET"])
def getRoom(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    room = Room.objects.get(id=pk)
    if(Home.objects.get(id=room.home_id).owner == user):
        return Response({'room':RoomSerializer(room,many=False).data},status=200)
    return Response({'message':"You Are Not Owner"},status=401)
   
@api_view(["GET"])
def getLight(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    light = Light.objects.get(id=pk)
    if(Home.objects.get(id=Room.objects.get(id=light.room_id).home_id).owner == user):
        return Response({'light':LightSerializer(light,many=False).data},status=200)
    return Response({'message':"You Are Not Owner"},status=401)



@api_view(["POST"])
def setHome(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    
    data = req.data.get('home')
    try:
        home = Home.objects.get(owner=user, id=pk)
    except Home.DoesNotExist:
        return Response({"message":"You are not owner of this house"},status=404)
    oldname = home.name
    home.name = data['name']
    for nroom in data['rooms']:
        room = Room.objects.get(id=nroom['id'])
        room.name = nroom['name']
        try:
            dev = Device.objects.get(id=nroom['device']['id'])
            room.device = dev
        except Exception as e:
            print(e)
            room.device = None
        room.save()
    home.save()
    return Response({'message':'Home {} Renamed Successfully!'.format(oldname)},status=200)

@api_view(["POST"])
def setRoom(req,pk):
    user = Token.objects.get(key=req.headers.get('Authorization')).user
    room = Room.objects.get(id=pk)
    if(Home.objects.get(id=room.home_id).owner == user):
        room.name = req.data.get('name')
        room.save()
        return Response({'message': "Room Renamed Successfully!"},status=200)
    return Response({'message':"You Are Not Owner"},status=401)
   
@api_view(["POST"])
def setLight(req,pk):
    try:
        user = Token.objects.get(key=req.headers['Authorization']).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    light = Light.objects.get(id=pk)

    if(light.room.home.owner == user):
        light.name = req.data['light']['name']
        light.port = int(req.data['light']['port'])
        light.save()
        return Response({'message': "Light Updated Successfully!"},status=200)
    return Response({'message':"You Are Not Owner"},status=401)

    

@api_view(["GET"])
def deleteHome(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    home = Home.objects.get(id=pk)
    if(home.owner == user):
        home.delete()
        return Response({'message': "Home Deleted Successfully!"},status=200)
    return Response({'message':"You Are Not Owner"},status=401)

@api_view(["GET"])
def deleteRoom(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    room = Room.objects.get(id=pk)
    if(room.home.owner == user):
        room.delete()
        return Response({'message': "Room Deleted Successfully!"},status=200)
    return Response({'message':"You Are Not Owner"},status=401)
   
@api_view(["GET"])
def deleteLight(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    light = Light.objects.get(id=pk)
    if(light.room.home.owner == user):
        light.delete()
        return Response({'message': "Light Deleted Successfully!"},status=200)
    return Response({'message':"You Are Not Owner"},status=401)



@api_view(['POST'])
def createHome(req):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    home = Home.objects.create(
        name = req.data['home']['name'],
        owner = user,
    )
    home.homies.add(user)
    home.save()
    return Response({'message': 'Home {} Created Successfully!'.format(home.name)},status=200)
    
@api_view(['POST'])
def createRoom(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    try:
        home = Home.objects.get(id=pk,owner=user)
    except Home.DoesNotExist:
        return Response({'message': "Unauthorised Access"}, status=401)

    if str(home.id) != req.data.get('home').get('id'):
        return Response({'message': "Home is not Accessible"}, status=401)

    Room.objects.create(
        name = req.data['room']['name'],
        home = home
    )
    return Response({'message': "New Room Created in {}".format(home.name)}, status=200)

@api_view(['POST'])
def createLight(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    try:
        room = Room.objects.get(id=pk)
    except Room.DoesNotExist: 
        return Response({'message': "Room Does not Exist"}, status=404)
    if room.home.owner != user:
        return Response({'message':"You Are Not Owner"},status=401)
    if pk != str(req.data.get('room')):
        return Response({"message": "Room id mismatch"},status=400)

    booked_ports = [x.port for x in room.light_set.all()]
    name = req.data.get('light').get('name')
    port = req.data.get('light').get('port')
    if int(port) in booked_ports:
        return Response({"message": "Port is already in Use"}, status=400)
    Light.objects.create(
        name= name,
        room = room,
        port = port,
    )
    return Response({'message': "New Light is Installed in {}".format(room.name)}, status=200)



@api_view(['GET'])
def getUsers(req):
    search = req.GET.get('q')
    users = User.objects.filter(Q(username__icontains = search) | Q(name__icontains=search))
    users = UserSerializer(users,many=True).data
    for user in users:
        user['homes'] = HomeSerializer(User.objects.get(username= user['username']).homie.all(),many=True).data

    return Response({'users': users},status=200)    

@api_view(["GET"])
def addreq(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    
    home = Home.objects.get(id=pk)
    home.requests.add(user)
    return Response({'message':'Request Sent Successfully!'},status=200)

@api_view(["GET"])
def removereq(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    
    home = Home.objects.get(id=pk)
    home.requests.remove(user)
    return Response({'message':'Request removed Successfully!'},status=200)


@api_view(['GET'])
def accept(req,homeid,username):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    requestingUser = User.objects.get(username=username)
    try:
        home = Home.objects.get(id=homeid, owner=user)
    except:
        return Response({'message':"Unauthorised Access!"}, status=401)
    home.requests.remove(requestingUser)
    home.homies.add(requestingUser)
    return Response({'message':"Request Accepted!"}, status=200)



@api_view(['GET'])
def deny(req,homeid,username):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    requestingUser = User.objects.get(username=username)
    try:
        home = Home.objects.get(id=homeid, owner=user)
    except:
        return Response({'message':"Unauthorised Access!"}, status=401)
    home.requests.remove(requestingUser)
    return Response({'message':"Request Denied!"}, status=200)



@api_view(['get'])
def leavehome(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    try:
        home = Home.objects.get(id=pk)
    except Home.DoesNotExist:
        return Response({"message":"Invalid House"},status=404)
    if home.owner == user:
        return Response({'message': "Owner Cannot Leave the House!"},status=400)    
    home.homies.remove(user)
    return Response({"message":"Left {} Successfully!".format(home)},status=200)
