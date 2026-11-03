from datetime import date

from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import CondicionVencimiento, Producto, TipoProducto


class ProductoVencimientoTests(TestCase):
    def setUp(self):
        self.tipo = TipoProducto.objects.create(nombre='PRODUCTO DE PRUEBA')
        self.condicion = CondicionVencimiento.objects.create(
            id_tipo_producto=self.tipo,
            metodo='refrigerado',
            duracion_valor=5,
            duracion_unidad='DIAS',
        )

    def test_save_calcula_vencimiento_cuando_no_se_proporciona(self):
        producto = Producto(
            id_tipo_producto=self.tipo,
            id_condicion=self.condicion,
            fecha_elaboracion=date(2026, 1, 1),
            cantidad=1,
            unidad_medida='kg',
        )

        producto.save()

        self.assertEqual(producto.fecha_vencimiento, date(2026, 1, 6))

    def test_save_preserva_vencimiento_manual(self):
        producto = Producto(
            id_tipo_producto=self.tipo,
            id_condicion=self.condicion,
            fecha_elaboracion=date(2026, 1, 1),
            fecha_vencimiento=date(2026, 2, 1),
            cantidad=1,
            unidad_medida='kg',
        )

        producto.save()

        self.assertEqual(producto.fecha_vencimiento, date(2026, 2, 1))

    def test_unidad_medida_es_requerida_y_tiene_opciones_controladas(self):
        field = next(
            (field for field in Producto._meta.fields if field.name == 'unidad_medida'),
            None,
        )

        self.assertIsNotNone(field, 'Producto debe guardar la unidad por lote')
        self.assertFalse(field.null)
        self.assertEqual(
            dict(field.choices),
            {
                'g': 'g',
                'kg': 'kg',
                'ml': 'ml',
                'l': 'l',
                'unidad': 'unidad',
                'paquete': 'paquete',
            },
        )

    def test_save_preserva_fecha_manual_para_condicion_proveedor(self):
        proveedor = CondicionVencimiento.objects.create(
            id_tipo_producto=self.tipo,
            metodo='bodega',
            especial='PROVEEDOR',
        )
        producto = Producto(
            id_tipo_producto=self.tipo,
            id_condicion=proveedor,
            fecha_elaboracion=date(2026, 1, 1),
            fecha_vencimiento=date(2026, 3, 1),
            cantidad=1,
            unidad_medida='kg',
        )

        producto.save()

        self.assertEqual(producto.fecha_vencimiento, date(2026, 3, 1))


class PerfilUsuarioTests(TestCase):
    def test_perfil_usuario_puede_no_tener_foto(self):
        try:
            perfil_model = apps.get_model('Inventory', 'PerfilUsuario')
        except LookupError:
            perfil_model = None

        self.assertIsNotNone(perfil_model, 'Debe existir el perfil de usuario opcional')
        usuario = get_user_model().objects.create_user(username='empleado-test')

        perfil = perfil_model.objects.create(usuario=usuario)

        self.assertFalse(perfil.foto_perfil)
