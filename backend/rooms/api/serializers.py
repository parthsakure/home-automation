from rest_framework.serializers import ModelSerializer
from rooms.models import Home,Room,Light,User,Device

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'username']

class HomeSerializer(ModelSerializer):
    class Meta:
        model=Home
        fields='__all__'



class RoomSerializer(ModelSerializer):
    class Meta:
        model=Room
        fields='__all__'




class LightSerializer(ModelSerializer):
    class Meta:
        model=Light
        fields='__all__'

class DeviceSerializer(ModelSerializer):
    class Meta:
        model=Device
        fields=['name', 'id', 'user']

