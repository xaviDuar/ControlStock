from rest_framework import serializers
from .models import TipoProducto, Producto

class TipoProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoProducto
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='id_tipo_producto.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'
