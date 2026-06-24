from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages

def home(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            messages.success(request, f'Bienvenido {user.username}')
            return redirect('inventario')
        else:
            messages.error(request, 'Usuario o contraseña incorrectos')
            return redirect('home')
    return render(request, 'home.html')

def logout_view(request):
    auth_logout(request)
    messages.success(request, 'Sesión cerrada correctamente')
    return redirect('home')
