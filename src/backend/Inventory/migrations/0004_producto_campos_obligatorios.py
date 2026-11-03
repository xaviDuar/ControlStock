from django.db import migrations, models
from django.db.models import Q


UNIDADES_MEDIDA = ('g', 'kg', 'ml', 'l', 'unidad', 'paquete')


def validar_lotes_completos(apps, schema_editor):
    Producto = apps.get_model('Inventory', 'Producto')
    db_alias = schema_editor.connection.alias
    incompletos = Producto.objects.using(db_alias).filter(
        Q(unidad_medida__isnull=True)
        | Q(unidad_medida='')
        | Q(id_condicion__isnull=True)
        | Q(fecha_vencimiento__isnull=True)
        | Q(cantidad__isnull=True)
        | Q(cantidad__lte=0)
    ).count()
    unidad_invalida = Producto.objects.using(db_alias).exclude(
        unidad_medida__in=UNIDADES_MEDIDA
    ).count()
    if incompletos or unidad_invalida:
        raise RuntimeError(
            'No se puede finalizar la migración: '
            f'{incompletos} lotes tienen datos obligatorios incompletos o cantidad no positiva; '
            f'{unidad_invalida} lotes tienen una unidad no permitida. '
            'Asigne datos reales antes de volver a migrar.'
        )


class Migration(migrations.Migration):

    dependencies = [
        ('Inventory', '0003_producto_unidad_perfil'),
    ]

    operations = [
        migrations.RunPython(validar_lotes_completos, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='producto',
            name='id_condicion',
            field=models.ForeignKey(
                db_column='id_condicion',
                on_delete=models.PROTECT,
                to='Inventory.condicionvencimiento',
            ),
        ),
        migrations.AlterField(
            model_name='producto',
            name='fecha_vencimiento',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='producto',
            name='cantidad',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='producto',
            name='unidad_medida',
            field=models.CharField(
                choices=[
                    ('g', 'g'),
                    ('kg', 'kg'),
                    ('ml', 'ml'),
                    ('l', 'l'),
                    ('unidad', 'unidad'),
                    ('paquete', 'paquete'),
                ],
                max_length=10,
            ),
        ),
        migrations.AddConstraint(
            model_name='producto',
            constraint=models.CheckConstraint(
                condition=Q(cantidad__gt=0),
                name='producto_cantidad_mayor_cero',
            ),
        ),
        migrations.AddConstraint(
            model_name='producto',
            constraint=models.CheckConstraint(
                condition=Q(unidad_medida__in=UNIDADES_MEDIDA),
                name='producto_unidad_medida_valida',
            ),
        ),
    ]
