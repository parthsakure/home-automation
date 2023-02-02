from django.shortcuts import render, HttpResponse,redirect
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .models import Home,User,Room,Light
from .forms import NewUserForm,HomeForm,RoomForm,LightForm

# Create your views here.


def addroom(req):
    return HttpResponse("adding room")


def defaultpage(req):
    if req.user.is_authenticated:
        if(Home.objects.filter(homies=req.user).count() >0):
            return redirect('home', Home.objects.filter(homies=req.user)[0].id)
        else:
            return render(req, 'rooms/home.html',{})
    return redirect('home', 0)


@login_required(login_url='login')
def homepage(req,pk):
    # q = req.GET.get('q') if req.GET.get('q')!= None else ''
    homes = Home.objects.filter(homies = req.user)

    rooms = []
    if homes.count() >0:
        rooms = Home.objects.get(id=pk).room_set.all()

    # lcount = Room__Light.count()
    context = {'homes':homes,'rooms':rooms,'home_id':pk}
    return render(req, 'rooms/home.html',context)



@login_required(login_url='login')
def roompage(req,pk,sk):
    homes = Home.objects.filter(homies = req.user)
    rooms = Home.objects.get(id=pk).room_set.all()
    lights = Room.objects.get(id=sk).light_set.all()

    context = {'homes':homes,'rooms':rooms,'lights': lights, 'home_id':pk, 'room_id':sk}

    return render(req, 'rooms/home.html', context)



def userLogin(req):
    if req.method == 'POST':
        username = req.POST.get('username')
        password = req.POST.get('password')

        try:
            user = User.objects.get(username=username)
        except:
            messages.error(req, "User Does Not Exist")

        user = authenticate(req, username=username, password=password)

        if user is not None:
            login(req,user)
            if Home.objects.filter(homies=user).count() > 0:
                return redirect('home', Home.objects.filter(homies=user)[0].id)
            else:
                return redirect('home', 1)
        else:
            messages.error(req, "Username & password does not match")
    page = 'login'
    return render(req, 'rooms/login.html', {'page':page})



@login_required(login_url='login')
def userLogout(req):
    logout(req)
    return redirect('home', 0)



def createUser(req):
    form = NewUserForm()
    if req.method == 'POST':
        form = NewUserForm(req.POST)
        if form.is_valid():
            user = form.save()
            login(req,user)
            return redirect('home',1)
        else:
            messages.error(req, "Try Using different Username")
    return render(req, 'rooms/login.html', {'form':form})




@login_required(login_url='login')
def createHome(req):
    form = HomeForm()
    if req.method=='POST':
        home = Home.objects.create(
            owner = req.user,
            name = req.POST.get('name')
        )
        home.homies.add(req.user)
        return redirect('home', home.id)

    context = {'form':form,'obj_type': 'Home'}
    return render(req, 'rooms/creationform.html', context)




@login_required(login_url='login')
def createRoom(req,pk):
    form = RoomForm()
    if req.method=='POST':
        room = Room.objects.create(
            name = req.POST.get('name'),
            home = Home.objects.get(id=pk)
        )
        return redirect('room', pk, room.id)

    context = {'form':form,'obj_type': 'Room'}
    return render(req, 'rooms/creationform.html', context)




@login_required(login_url='login')
def createLight(req,pk,sk):
    form = LightForm()
    if req.method == 'POST':
        light = Light.objects.create(
            name = req.POST.get('name'),
            room = Room.objects.get(id=sk)
        )
        return redirect('room', pk,sk)
    
    context = {'form':form,'obj_type': 'Light'}
    return render(req, 'rooms/creationform.html', context)
