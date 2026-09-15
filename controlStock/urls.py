from django.contrib import admin
from django.urls import include, path
from Inventory.api import (
    TipoProductoViewSet, ProductoViewSet, CondicionViewSet,
    VentaViewSet, DesperdicioViewSet, login_api, me, metricas,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'tipos', TipoProductoViewSet, basename='tipo')
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'condiciones', CondicionViewSet, basename='condicion')
router.register(r'ventas', VentaViewSet, basename='venta')
router.register(r'desperdicios', DesperdicioViewSet, basename='desperdicio')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', login_api),
    path('api/auth/me/', me),
    path('api/metricas/', metricas),
    path('api/', include(router.urls)),
    path('', include('core.urls')),
    path('inventario/', include('Inventory.urls')),
]
