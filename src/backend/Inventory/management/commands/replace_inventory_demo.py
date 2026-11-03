from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from Inventory.models import CondicionVencimiento, Desperdicio, Producto, TipoProducto, Venta


LOTES_DEMO = (
    {
        'tipo': 'JAMON COCIDO',
        'metodo': 'refrigerado',
        'anotacion': 'horma cortada, con folex y film',
        'duracion_valor': 5,
        'duracion_unidad': 'DIAS',
        'especial': None,
        'dias_elaboracion': -6,
        'cantidad': 2.5,
        'unidad_medida': 'kg',
        'proveedor': 'Fiambres del Sur',
        'costo_unitario': '8500.00',
    },
    {
        'tipo': 'GUACAMOLE',
        'metodo': 'refrigerado',
        'anotacion': None,
        'duracion_valor': 48,
        'duracion_unidad': 'HS',
        'especial': None,
        'dias_elaboracion': -1,
        'cantidad': 1.2,
        'unidad_medida': 'kg',
        'proveedor': 'Huerta Central',
        'costo_unitario': '6200.00',
    },
    {
        'tipo': 'SALSA BARBACOA',
        'metodo': 'bodega',
        'anotacion': None,
        'duracion_valor': None,
        'duracion_unidad': None,
        'especial': 'PROVEEDOR',
        'dias_elaboracion': -15,
        'dias_vencimiento_manual': 30,
        'cantidad': 750,
        'unidad_medida': 'ml',
        'proveedor': 'Salsas del Oeste',
        'costo_unitario': '4100.00',
    },
    {
        'tipo': 'MANGO',
        'metodo': 'congelado',
        'anotacion': None,
        'duracion_valor': 6,
        'duracion_unidad': 'MESES',
        'especial': None,
        'dias_elaboracion': -60,
        'cantidad': 1.5,
        'unidad_medida': 'kg',
        'proveedor': 'Frutas Congeladas SRL',
        'costo_unitario': '3900.00',
    },
    {
        'tipo': 'PAN ARABE',
        'metodo': 'congelado',
        'anotacion': None,
        'duracion_valor': 6,
        'duracion_unidad': 'MESES',
        'especial': None,
        'dias_elaboracion': -30,
        'dias_vencimiento_manual': 90,
        'cantidad': 12,
        'unidad_medida': 'paquete',
        'proveedor': 'Panificados La Espiga',
        'costo_unitario': '1200.00',
    },
    {
        'tipo': 'TARTA BANOFEE',
        'metodo': 'toppinera',
        'anotacion': None,
        'duracion_valor': 48,
        'duracion_unidad': 'HS',
        'especial': None,
        'dias_elaboracion': -2,
        'cantidad': 6,
        'unidad_medida': 'unidad',
        'proveedor': None,
        'costo_unitario': '2800.00',
    },
    {
        'tipo': 'QUINOA',
        'metodo': 'refrigerado',
        'anotacion': 'bolsa cerrada',
        'duracion_valor': 3,
        'duracion_unidad': 'DIAS',
        'especial': None,
        'dias_elaboracion': -1,
        'cantidad': 850,
        'unidad_medida': 'g',
        'proveedor': 'Cereales Andinos',
        'costo_unitario': '2500.00',
    },
    {
        'tipo': 'CROISSANT',
        'metodo': 'toppinera',
        'anotacion': None,
        'duracion_valor': 6,
        'duracion_unidad': 'HS',
        'especial': None,
        'dias_elaboracion': 0,
        'cantidad': 8,
        'unidad_medida': 'unidad',
        'proveedor': None,
        'costo_unitario': '1400.00',
    },
    {
        'tipo': 'QUESO PARMESANO',
        'metodo': 'refrigerado',
        'anotacion': 'HORMA ABIERTA',
        'duracion_valor': 4,
        'duracion_unidad': 'MESES',
        'especial': None,
        'dias_elaboracion': -30,
        'cantidad': 900,
        'unidad_medida': 'g',
        'proveedor': 'Lácteos Pampeanos',
        'costo_unitario': '13000.00',
    },
    {
        'tipo': 'TOMATE CHERRY',
        'metodo': 'refrigerado',
        'anotacion': None,
        'duracion_valor': 7,
        'duracion_unidad': 'DIAS',
        'especial': None,
        'dias_elaboracion': -4,
        'cantidad': 3,
        'unidad_medida': 'paquete',
        'proveedor': 'Quinta Don Pedro',
        'costo_unitario': '1800.00',
    },
)


class Command(BaseCommand):
    help = 'Reemplaza el inventario ficticio por diez lotes de demostración.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Confirma el reemplazo de todas las partidas Producto existentes.',
        )

    def handle(self, *args, **options):
        if not options['replace']:
            raise CommandError('El reemplazo es destructivo; volvé a ejecutar con --replace.')

        with transaction.atomic():
            producto_ids = list(
                Producto.objects.select_for_update().values_list('pk', flat=True)
            )
            relacionados = Venta.objects.select_for_update().filter(
                id_producto_id__in=producto_ids
            ).exists() or Desperdicio.objects.select_for_update().filter(
                id_producto_id__in=producto_ids
            ).exists()
            if relacionados:
                raise CommandError(
                    'No se puede reemplazar el inventario si hay ventas o desperdicios asociados.'
                )

            hoy = timezone.localdate()
            lotes_resueltos = []
            for datos in LOTES_DEMO:
                try:
                    tipo = TipoProducto.objects.get(nombre=datos['tipo'])
                    condicion = CondicionVencimiento.objects.get(
                        id_tipo_producto=tipo,
                        metodo=datos['metodo'],
                        anotacion=datos['anotacion'],
                        duracion_valor=datos['duracion_valor'],
                        duracion_unidad=datos['duracion_unidad'],
                        especial=datos['especial'],
                    )
                except (TipoProducto.DoesNotExist, CondicionVencimiento.DoesNotExist) as error:
                    raise CommandError(
                        f'Falta un producto o condición del catálogo: {datos["tipo"]}.'
                    ) from error
                except CondicionVencimiento.MultipleObjectsReturned as error:
                    raise CommandError(f'Hay condiciones duplicadas para {datos["tipo"]}.') from error

                fecha_elaboracion = hoy + timedelta(days=datos['dias_elaboracion'])
                fecha_vencimiento = None
                if 'dias_vencimiento_manual' in datos:
                    fecha_vencimiento = hoy + timedelta(days=datos['dias_vencimiento_manual'])
                lotes_resueltos.append((datos, tipo, condicion, fecha_elaboracion, fecha_vencimiento))

            Producto.objects.filter(pk__in=producto_ids).delete()
            for datos, tipo, condicion, fecha_elaboracion, fecha_vencimiento in lotes_resueltos:
                Producto.objects.create(
                    id_tipo_producto=tipo,
                    id_condicion=condicion,
                    fecha_elaboracion=fecha_elaboracion,
                    fecha_vencimiento=fecha_vencimiento,
                    cantidad=datos['cantidad'],
                    unidad_medida=datos['unidad_medida'],
                    proveedor=datos['proveedor'],
                    costo_unitario=datos['costo_unitario'],
                )

        self.stdout.write(self.style.SUCCESS('Se reemplazó el inventario por 10 lotes ficticios.'))
