from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio
from .serializers import (
    TipoProductoSerializer, CondicionVencimientoSerializer,
    ProductoSerializer, VentaSerializer, DesperdicioSerializer,
)
from django.db.models import Sum, F, ExpressionWrapper, DecimalField

class TipoProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoProducto.objects.prefetch_related('condicionvencimiento_set')
    serializer_class = TipoProductoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']
    permission_classes = [IsAuthenticated]

class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Producto.objects.select_related('id_tipo_producto', 'id_condicion').all()
    serializer_class = ProductoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['id_tipo_producto__nombre', 'proveedor']
    permission_classes = [IsAuthenticated]

class CondicionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CondicionVencimiento.objects.select_related('id_tipo_producto')
    serializer_class = CondicionVencimientoSerializer
    permission_classes = [IsAuthenticated]

class VentaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venta.objects.select_related('id_producto')
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]

class DesperdicioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Desperdicio.objects.select_related('id_producto')
    serializer_class = DesperdicioSerializer
    permission_classes = [IsAuthenticated]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metricas(request):
    """Rendimiento, desperdicio y ganancia por producto."""
    ventas_agg = {
        r['id_producto_id']: r
        for r in Venta.objects.values('id_producto_id').annotate(
            unidades=Sum('cantidad'),
            ingresos=Sum(ExpressionWrapper(
                F('cantidad') * F('precio_unitario'),
                output_field=DecimalField(max_digits=14, decimal_places=2),
            )),
        )
    }
    desper_agg = {
        r['id_producto_id']: r
        for r in Desperdicio.objects.values('id_producto_id').annotate(
            unidades=Sum('cantidad'),
            costo=Sum(ExpressionWrapper(
                F('cantidad') * F('id_producto__costo_unitario'),
                output_field=DecimalField(max_digits=14, decimal_places=2),
            )),
        )
    }
    filas = []
    for prod in Producto.objects.select_related('id_tipo_producto'):
        v = ventas_agg.get(prod.id_producto) or {}
        d = desper_agg.get(prod.id_producto) or {}
        vendidas = v.get('unidades') or 0
        desperdiciadas = d.get('unidades') or 0
        rendimiento = (vendidas / prod.cantidad) if prod.cantidad else None
        costo_total = (prod.costo_unitario or 0) * (prod.cantidad or 0)
        ganancia = ((v.get('ingresos') or 0) - costo_total - (d.get('costo') or 0))
        filas.append({
            'id_producto': prod.id_producto,
            'nombre': prod.id_tipo_producto.nombre,
            'cantidad': prod.cantidad,
            'vendido': vendidas,
            'desperdiciado': desperdiciadas,
            'rendimiento': round(rendimiento, 4) if rendimiento is not None else None,
            'ingresos': float(v.get('ingresos') or 0),
            'costo_total': float(costo_total),
            'costo_desperdicio': float(d.get('costo') or 0),
            'ganancia': float(ganancia),
        })
    return Response(filas)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})
    return Response({'error': 'Credenciales inválidas'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({'username': request.user.username, 'id': request.user.id})
