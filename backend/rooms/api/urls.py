from django.urls import path,include
from . import views

urlpatterns = [
    path('login/', views.loginUser, name='login-api'),
    path('logout/', views.logoutUser, name='logout-api'),
    path('register/', views.registerUser, name='register-api'),

    path('search/', views.getUsers, name='search-user-api'),
    path('requests/', views.getRequests, name='requests-api'),

    path('rooms/', views.getHomes, name='rooms-api'),
    path('rooms/<str:pk>/', views.getLights, name='lights-api'),
    path('set/<str:pk>/<int:state>', views.setLightState, name='light-state-api'),


    path('home/<str:pk>/', views.getHome, name='get-home-api'),
    path('room/<str:pk>/', views.getRoom, name='get-room-api'),
    path('light/<str:pk>/', views.getLight, name='get-light-api'),

    path('edit/home/<str:pk>/', views.setHome, name='set-home-api'),
    path('edit/light/<str:pk>/', views.setLight, name='set-light-api'),

    path('delete/home/<str:pk>/', views.deleteHome, name='delete-home-api'),
    path('delete/room/<str:pk>/', views.deleteRoom, name='delete-room-api'),
    path('delete/light/<str:pk>/', views.deleteLight, name='delete-light-api'),

    path('create/home/', views.createHome, name='create-home-api'),
    path('create/room/<str:pk>/', views.createRoom, name='create-room-api'),
    path('create/light/<str:pk>/', views.createLight, name='create-light-api'),

    path('sendrequest/<str:pk>/', views.addreq, name='send-req-api'),
    path('removerequest/<str:pk>/', views.removereq, name='remove-req-api'),

    path('accept/<str:homeid>/<str:username>/', views.accept, name='accept-req-api'),
    path('deny/<str:homeid>/<str:username>/', views.deny, name='accept-req-api'),


    path('leave/home/<str:pk>/', views.leavehome, name='leave-api'),

    path('device/', include("rooms.api.device.urls")),

]
