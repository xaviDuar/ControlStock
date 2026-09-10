from django.contrib import admin
from .models import TipoProducto, Producto

@admin.register(TipoProducto)
class TipoProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'vencimiento_refrigerado', 'vencimiento_congelado', 'vencimiento_bodega', 'vencimiento_toppinera')
    search_fields = ('nombre',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id_tipo_producto', 'fecha_elaboracion', 'cantidad', 'proveedor')
    list_filter = ('id_tipo_producto', 'fecha_elaboracion')
    search_fields = ('proveedor',)
