from django.contrib import admin
from .models import TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio

class CondicionInline(admin.TabularInline):
    model = CondicionVencimiento
    extra = 0
    fields = ('metodo', 'anotacion', 'duracion_valor', 'duracion_unidad', 'especial')

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
    list_display = ('id_tipo_producto', 'fecha_elaboracion', 'fecha_vencimiento', 'id_condicion', 'cantidad', 'costo_unitario', 'proveedor')
    list_filter = ('id_condicion__metodo', 'fecha_elaboracion')
    search_fields = ('proveedor', 'id_tipo_producto__nombre')

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id_producto', 'fecha', 'cantidad', 'precio_unitario')
    list_filter = ('fecha',)

@admin.register(Desperdicio)
class DesperdicioAdmin(admin.ModelAdmin):
    list_display = ('id_producto', 'fecha', 'cantidad', 'motivo', 'costo_perdido')
    list_filter = ('fecha', 'motivo')
