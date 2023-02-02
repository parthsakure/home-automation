from rest_framework.response import Response
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import check_password, make_password
from rooms.models import Device
from rooms.api.serializers import DeviceSerializer


@api_view(["GET"])
def getStates(req,pk):
    try:
        device = Device.objects.get(id=pk)
    except:
        return Response({"message":"Device Not Found"},status=404)
    
    states = {}
    
    for room in device.room_set.all():
        for light in room.light_set.all():
            states[light.port] = light.state
    for i in range(10):
        if i not in states:
            states[i] = False
    return Response({'states':states},status=200)


@api_view(["GET"])
def getDevices(req):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    
    devices = user.device_set.all()
    devices= DeviceSerializer(devices, many=True).data
    return Response({"devices": devices},status=200)


@api_view(["POST"])
def createDevice(req):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)

    devname = req.data['name']
    password = req.data['password']
    try:
        device = Device.objects.create(
            user = user,
            name = devname,
            password = make_password(password=password)
        )
        device.save()
    except Exception as e:
        return Response({'message': e},status=400)
    device = DeviceSerializer(device,many=False)
    return Response({"device": device.data, "message": "Device Created"},status=200)


@api_view(["get"])
def deleteDevice(req,pk):
    try:
        user = Token.objects.get(key=req.headers.get('Authorization')).user
    except Token.DoesNotExist:
        return Response({'message': "user Does not Exist"}, status=404)
    device = Device.objects.get(id=pk)
    if device.user != user:
        return Response({'message': "You don't own This Device"}, status=400)
    device.delete()
    return Response({"message":"Device Deleted!"},status=200)

