from django.urls import path,include
from . import views


urlpatterns = [
    path('add/', views.addroom, name='add-room'),
    path('<int:pk>/', views.homepage, name='home'),
    path('<int:pk>/<int:sk>/', views.roompage, name='room'),
    path('', views.defaultpage, name='default'),
    path('login/', views.userLogin, name='login'),
    path('logout/', views.userLogout, name='logout'),
    path('register/',views.createUser, name='register'),
    path('createhome/',views.createHome, name='create-home'),
    path('createroom/<int:pk>/',views.createRoom, name='create-room'),
    path('createlight/<int:pk>/<int:sk>/',views.createLight, name='create-light'),
         
         
]
