from rest_framework import serializers
from .models import TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio

class CondicionVencimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CondicionVencimiento
        fields = '__all__'

class TipoProductoSerializer(serializers.ModelSerializer):
    condiciones = CondicionVencimientoSerializer(source='condicionvencimiento_set', many=True, read_only=True)

    class Meta:
        model = TipoProducto
        fields = [
            'id_tipo_producto', 'nombre',
            'vencimiento_refrigerado', 'vencimiento_congelado',
            'vencimiento_bodega', 'vencimiento_toppinera', 'observaciones',
            'condiciones',
        ]

class ProductoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='id_tipo_producto.nombre', read_only=True)
    condicion = CondicionVencimientoSerializer(source='id_condicion', read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = '__all__'

class DesperdicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Desperdicio
        fields = '__all__'