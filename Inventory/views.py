from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import TipoProducto, Producto

@login_required
def inventario(request):
    query = request.GET.get('q', '')
    if query:
        tipos = TipoProducto.objects.filter(nombre__icontains=query)
    else:
        tipos = TipoProducto.objects.all()
    return render(request, 'inventario.html', {'tipos': tipos, 'query': query})

@login_required
def rotulos(request):
    tipos = TipoProducto.objects.all()
    return render(request, 'rotulos.html', {'tipos': tipos})
