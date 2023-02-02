from django.contrib import admin
from .models import User, Home,Room,Light,Device
# Register your models here.
admin.site.register(User)
admin.site.register(Home)
admin.site.register(Room)
admin.site.register(Light)
admin.site.register(Device)