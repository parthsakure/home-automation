from django.forms import ModelForm
from django.contrib.auth.forms import UserCreationForm
from .models import Home,User,Room,Light

class NewUserForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'name', 'email', 'password1', 'password2']


class HomeForm(ModelForm):
    class Meta:
        model = Home
        fields = ['name']



class RoomForm(ModelForm):
    class Meta:
        model = Room
        fields = ['name']


class LightForm(ModelForm):
    class Meta:
        model = Light
        fields = ['name']