from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.contrib.admin.sites import NotRegistered
from .models import (
    TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio,
    PerfilUsuario,
)

class CondicionInline(admin.TabularInline):
    model = CondicionVencimiento
    extra = 0
    fields = ('metodo', 'anotacion', 'duracion_valor', 'duracion_unidad', 'especial')

class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    extra = 0
    max_num = 1

@admin.register(TipoProducto)
class TipoProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)
    inlines = [CondicionInline]

@admin.register(CondicionVencimiento)
class CondicionAdmin(admin.ModelAdmin):
    list_display = ('id_tipo_producto', 'metodo', 'anotacion', 'duracion_valor', 'duracion_unidad', 'especial')
    list_filter = ('metodo', 'especial')
    search_fields = ('id_tipo_producto__nombre',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id_tipo_producto', 'fecha_elaboracion', 'fecha_vencimiento', 'id_condicion', 'cantidad', 'unidad_medida', 'costo_unitario', 'proveedor')
    list_filter = ('id_condicion__metodo', 'fecha_elaboracion')
    search_fields = ('proveedor', 'id_tipo_producto__nombre')


User = get_user_model()
try:
    admin.site.unregister(User)
except NotRegistered:
    pass


@admin.register(User)
class UsuarioAdmin(UserAdmin):
    inlines = [*UserAdmin.inlines, PerfilUsuarioInline]

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id_producto', 'fecha', 'cantidad', 'precio_unitario')
    list_filter = ('fecha',)

@admin.register(Desperdicio)
class DesperdicioAdmin(admin.ModelAdmin):
    list_display = ('id_producto', 'fecha', 'cantidad', 'motivo', 'costo_perdido')
    list_filter = ('fecha', 'motivo')
