from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# Create your models here.
class User(AbstractUser):
    name = models.CharField(max_length=200,null=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    REQUIRED_FIELDS = []


class Home(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    homies = models.ManyToManyField(User,related_name='homie')
    requests = models.ManyToManyField(User,related_name='request')
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        return self.name
    

class Device(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,default=None)
    name = models.CharField(max_length=200)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4,editable=False)
    password = models.CharField(max_length=500,default=uuid.uuid4)

    def __str__(self) -> str:
        return self.name
    

class Room(models.Model):
    name = models.CharField(max_length=200)
    home = models.ForeignKey(Home, on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(Device, on_delete=models.DO_NOTHING,null=True)

    def __str__(self) -> str:
        return self.name
    


class Light(models.Model):
    name= models.CharField(max_length=200)
    state = models.BooleanField(default=False)
    room = models.ForeignKey(Room ,on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    port = models.IntegerField(default=0)

    def __str__(self) -> str:
        return self.name
    