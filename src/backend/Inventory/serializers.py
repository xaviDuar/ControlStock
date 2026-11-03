from rest_framework import serializers
from .models import (
    TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio,
    calcular_fecha_vencimiento,
)

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
    fecha_vencimiento = serializers.DateField(required=False)

    class Meta:
        model = Producto
        fields = '__all__'

    def validate(self, attrs):
        tipo = attrs.get('id_tipo_producto')
        condicion = attrs.get('id_condicion')
        if condicion and tipo and condicion.id_tipo_producto_id != tipo.id_tipo_producto:
            raise serializers.ValidationError({
                'id_condicion': 'La condición debe pertenecer al producto seleccionado.'
            })

        cantidad = attrs.get('cantidad')
        if cantidad is not None and cantidad <= 0:
            raise serializers.ValidationError({
                'cantidad': 'La cantidad debe ser mayor que cero.'
            })

        if 'fecha_vencimiento' not in attrs:
            fecha_elaboracion = attrs.get('fecha_elaboracion')
            vencimiento = calcular_fecha_vencimiento(fecha_elaboracion, condicion)
            if vencimiento is None:
                raise serializers.ValidationError({
                    'fecha_vencimiento': 'Ingresá la fecha de vencimiento indicada en el envase.'
                })
            attrs['fecha_vencimiento'] = vencimiento

        return attrs

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = '__all__'

class DesperdicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Desperdicio
        fields = '__all__'
