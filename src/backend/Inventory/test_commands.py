from datetime import date
from decimal import Decimal

from django.core.management import call_command, CommandError
from django.db import connection
from django.test import TransactionTestCase

from .models import (
    CondicionVencimiento,
    Desperdicio,
    Producto,
    TipoProducto,
    Venta,
)


CATALOGO_DEMO = (
    ('JAMON COCIDO', 'refrigerado', 'horma cortada, con folex y film', 5, 'DIAS', None),
    ('GUACAMOLE', 'refrigerado', None, 48, 'HS', None),
    ('SALSA BARBACOA', 'bodega', None, None, None, 'PROVEEDOR'),
    ('MANGO', 'congelado', None, 6, 'MESES', None),
    ('PAN ARABE', 'congelado', None, 6, 'MESES', None),
    ('TARTA BANOFEE', 'toppinera', None, 48, 'HS', None),
    ('QUINOA', 'refrigerado', 'bolsa cerrada', 3, 'DIAS', None),
    ('CROISSANT', 'toppinera', None, 6, 'HS', None),
    ('QUESO PARMESANO', 'refrigerado', 'HORMA ABIERTA', 4, 'MESES', None),
    ('TOMATE CHERRY', 'refrigerado', None, 7, 'DIAS', None),
)


class ReplaceInventoryDemoCommandTests(TransactionTestCase):
    def setUp(self):
        self.tipo_viejo = TipoProducto.objects.create(nombre='LOTE VIEJO')
        condicion_vieja = CondicionVencimiento.objects.create(
            id_tipo_producto=self.tipo_viejo,
            metodo='refrigerado',
            duracion_valor=5,
            duracion_unidad='DIAS',
        )
        self.producto_viejo = Producto.objects.create(
            id_tipo_producto=self.tipo_viejo,
            id_condicion=condicion_vieja,
            fecha_elaboracion=date(2026, 1, 1),
            fecha_vencimiento=date(2026, 1, 6),
            cantidad=1,
            unidad_medida='unidad',
        )

    def _run_replace_command(self, *args, **kwargs):
        try:
            return call_command('replace_inventory_demo', *args, **kwargs)
        except CommandError as error:
            if "Unknown command: 'replace_inventory_demo'" in str(error):
                self.fail('Falta el comando replace_inventory_demo')
            raise

    def _crear_catalogo_demo(self):
        for nombre, metodo, anotacion, valor, unidad, especial in CATALOGO_DEMO:
            tipo = TipoProducto.objects.create(nombre=nombre)
            CondicionVencimiento.objects.create(
                id_tipo_producto=tipo,
                metodo=metodo,
                anotacion=anotacion,
                duracion_valor=valor,
                duracion_unidad=unidad,
                especial=especial,
            )

    def test_sin_replace_no_modifica_inventario(self):
        with self.assertRaisesMessage(CommandError, '--replace'):
            self._run_replace_command()

        self.assertEqual(Producto.objects.count(), 1)
        self.assertTrue(Producto.objects.filter(pk=self.producto_viejo.pk).exists())

    def test_precondiciones_relacionadas_se_revisan_en_transaccion(self):
        self._crear_catalogo_demo()
        consultas_transaccionales = []

        def registrar_consulta(execute, sql, params, many, context):
            normalized_sql = sql.lower()
            if 'from "venta"' in normalized_sql or 'from "desperdicio"' in normalized_sql:
                consultas_transaccionales.append(connection.in_atomic_block)
            return execute(sql, params, many, context)

        self.assertFalse(connection.in_atomic_block)
        with connection.execute_wrapper(registrar_consulta):
            self._run_replace_command(replace=True)

        self.assertGreaterEqual(len(consultas_transaccionales), 2)
        self.assertTrue(all(consultas_transaccionales))

    def test_replace_crea_diez_lotes_y_preserva_catalogo(self):
        self._crear_catalogo_demo()
        tipos_antes = TipoProducto.objects.count()
        condiciones_antes = CondicionVencimiento.objects.count()

        self._run_replace_command(replace=True)

        lotes = list(Producto.objects.select_related('id_tipo_producto', 'id_condicion'))
        self.assertEqual(len(lotes), 10)
        self.assertEqual(TipoProducto.objects.count(), tipos_antes)
        self.assertEqual(CondicionVencimiento.objects.count(), condiciones_antes)
        self.assertFalse(Producto.objects.filter(pk=self.producto_viejo.pk).exists())
        self.assertTrue(all(lote.unidad_medida for lote in lotes))
        self.assertTrue(all(lote.fecha_vencimiento for lote in lotes))
        self.assertTrue(all(lote.cantidad > 0 for lote in lotes))
        self.assertIn('PROVEEDOR', [lote.id_condicion.especial for lote in lotes])

    def test_replace_se_aborta_si_hay_venta_asociada(self):
        self._crear_catalogo_demo()
        Venta.objects.create(
            id_producto=self.producto_viejo,
            fecha=date(2026, 1, 2),
            cantidad=0.5,
            precio_unitario=Decimal('100.00'),
        )

        with self.assertRaisesMessage(CommandError, 'ventas o desperdicios'):
            self._run_replace_command(replace=True)

        self.assertTrue(Producto.objects.filter(pk=self.producto_viejo.pk).exists())
        self.assertEqual(Producto.objects.count(), 1)

    def test_replace_se_aborta_si_hay_desperdicio_asociado(self):
        self._crear_catalogo_demo()
        Desperdicio.objects.create(
            id_producto=self.producto_viejo,
            fecha=date(2026, 1, 2),
            cantidad=0.5,
            motivo='vencido',
        )

        with self.assertRaisesMessage(CommandError, 'ventas o desperdicios'):
            self._run_replace_command(replace=True)

        self.assertTrue(Producto.objects.filter(pk=self.producto_viejo.pk).exists())
        self.assertEqual(Producto.objects.count(), 1)
