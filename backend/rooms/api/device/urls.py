from django.urls import path

from . import views

urlpatterns = [
    path("states/<str:pk>/", views.getStates, name="device-login-api"),
    path("", views.getDevices, name="device-login-api"),
    path("create/", views.createDevice, name="device-login-api"),
    path("delete/<str:pk>", views.deleteDevice, name="device-login-api"),
]
