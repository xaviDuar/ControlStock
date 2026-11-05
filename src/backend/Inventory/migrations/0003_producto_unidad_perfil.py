import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Inventory', '0002_producto_costo_unitario_producto_fecha_vencimiento_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='producto',
            name='unidad_medida',
            field=models.CharField(
                blank=True,
                choices=[
                    ('g', 'g'),
                    ('kg', 'kg'),
                    ('ml', 'ml'),
                    ('l', 'l'),
                    ('unidad', 'unidad'),
                    ('paquete', 'paquete'),
                ],
                max_length=10,
                null=True,
            ),
        ),
        migrations.CreateModel(
            name='PerfilUsuario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('foto_perfil', models.ImageField(blank=True, null=True, upload_to='perfiles/')),
                ('usuario', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='perfil',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Perfil de usuario',
                'verbose_name_plural': 'Perfiles de usuario',
                'db_table': 'perfil_usuario',
            },
        ),
    ]
