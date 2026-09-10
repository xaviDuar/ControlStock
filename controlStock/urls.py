from django.contrib import admin
from django.urls import include, path
from Inventory.api import TipoProductoViewSet, ProductoViewSet, login_api, me
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'tipos', TipoProductoViewSet, basename='tipo')
router.register(r'productos', ProductoViewSet, basename='producto')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', login_api),
    path('api/auth/me/', me),
    path('api/', include(router.urls)),
    path('', include('core.urls')),
    path('inventario/', include('Inventory.urls')),
]
