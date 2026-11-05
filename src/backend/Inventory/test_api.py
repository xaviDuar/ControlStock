from datetime import date
import importlib
from io import BytesIO
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from django.urls import clear_url_caches, resolve
from django.views.static import serve
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import SimpleTestCase

from .models import CondicionVencimiento, PerfilUsuario, Producto, TipoProducto


class ProductoCreateApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='empleado-api')
        self.client.force_authenticate(self.user)
        self.tipo = TipoProducto.objects.create(nombre='PRODUCTO API')
        self.condicion = CondicionVencimiento.objects.create(
            id_tipo_producto=self.tipo,
            metodo='refrigerado',
            duracion_valor=5,
            duracion_unidad='DIAS',
        )
        self.proveedor = CondicionVencimiento.objects.create(
            id_tipo_producto=self.tipo,
            metodo='bodega',
            especial='PROVEEDOR',
        )
        self.payload = {
            'id_tipo_producto': self.tipo.pk,
            'id_condicion': self.condicion.pk,
            'fecha_elaboracion': '2026-01-01',
            'fecha_vencimiento': '2026-02-01',
            'cantidad': 2.5,
            'unidad_medida': 'kg',
            'proveedor': 'Distribuidora de prueba',
        }

    def test_post_producto_autenticado_crea_lote_con_unidad_y_fecha(self):
        response = self.client.post('/api/productos/', self.payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        producto = Producto.objects.get()
        self.assertEqual(producto.unidad_medida, 'kg')
        self.assertEqual(producto.fecha_vencimiento, date(2026, 2, 1))
        self.assertEqual(producto.cantidad, 2.5)

    def test_post_producto_calcula_vencimiento_si_no_se_envia(self):
        payload = {**self.payload}
        payload.pop('fecha_vencimiento')

        response = self.client.post('/api/productos/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fecha_vencimiento'], '2026-01-06')

    def test_post_producto_rechaza_unidad_o_cantidad_invalidas(self):
        for cambios in ({'unidad_medida': 'taza'}, {'cantidad': 0}):
            with self.subTest(cambios=cambios):
                response = self.client.post(
                    '/api/productos/', {**self.payload, **cambios}, format='json'
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Producto.objects.count(), 0)

    def test_post_proveedor_requiere_fecha_vencimiento_manual(self):
        payload = {
            **self.payload,
            'id_condicion': self.proveedor.pk,
        }
        payload.pop('fecha_vencimiento')

        response = self.client.post('/api/productos/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Producto.objects.count(), 0)

    def test_post_rechaza_condicion_de_otro_tipo(self):
        otro_tipo = TipoProducto.objects.create(nombre='OTRO PRODUCTO API')
        otra_condicion = CondicionVencimiento.objects.create(
            id_tipo_producto=otro_tipo,
            metodo='refrigerado',
            duracion_valor=2,
            duracion_unidad='DIAS',
        )

        response = self.client.post(
            '/api/productos/',
            {**self.payload, 'id_condicion': otra_condicion.pk},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Producto.objects.count(), 0)

    def test_producto_api_no_permite_put_patch_delete(self):
        producto = Producto.objects.create(
            id_tipo_producto=self.tipo,
            id_condicion=self.condicion,
            fecha_elaboracion=date(2026, 1, 1),
            fecha_vencimiento=date(2026, 1, 6),
            cantidad=1,
            unidad_medida='unidad',
        )
        url = f'/api/productos/{producto.pk}/'

        self.assertEqual(self.client.put(url, {}, format='json').status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(self.client.patch(url, {}, format='json').status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_post_producto_requiere_autenticacion(self):
        self.client.force_authenticate(user=None)

        response = self.client.post('/api/productos/', self.payload, format='json')

        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))


class PerfilUsuarioApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='empleado-perfil')
        self.client.force_authenticate(self.user)

    def test_me_devuelve_foto_null_sin_perfil(self):
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('foto_perfil', response.data)
        self.assertIsNone(response.data['foto_perfil'])

    def test_me_devuelve_url_cuando_hay_foto(self):
        with TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                image = Image.new('RGB', (1, 1), color='green')
                contents = BytesIO()
                image.save(contents, format='PNG')
                PerfilUsuario.objects.create(
                    usuario=self.user,
                    foto_perfil=SimpleUploadedFile(
                        'avatar.png', contents.getvalue(), content_type='image/png'
                    ),
                )

                response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('foto_perfil', response.data)
        self.assertEqual(
            response.data['foto_perfil'],
            'http://testserver/media/perfiles/avatar.png',
        )


class MediaRoutingTests(SimpleTestCase):
    def test_media_url_resolves_to_django_file_server(self):
        with override_settings(DEBUG=True):
            import controlStock.urls as urlconf

            urlconf = importlib.reload(urlconf)
            clear_url_caches()
            resolved = resolve('/media/perfiles/avatar.png', urlconf=urlconf)

        self.assertIs(resolved.func, serve)
