from django.db import models

class TipoProducto(models.Model):
    id_tipo_producto = models.AutoField(primary_key=True, db_column='id_tipo_producto')
    nombre = models.TextField(unique=True)
    vencimiento_refrigerado = models.CharField(max_length=100, null=True, blank=True)
    vencimiento_congelado = models.CharField(max_length=100, null=True, blank=True)
    vencimiento_bodega = models.CharField(max_length=100, null=True, blank=True)
    vencimiento_toppinera = models.CharField(max_length=100, null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'tipo_producto'
        verbose_name = 'Tipo de Producto'
        verbose_name_plural = 'Tipos de Producto'

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True, db_column='id_producto')
    id_tipo_producto = models.ForeignKey(TipoProducto, on_delete=models.CASCADE, db_column='id_tipo_producto')
    fecha_elaboracion = models.DateField()
    cantidad = models.FloatField(null=True, blank=True)
    proveedor = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'producto'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def __str__(self):
        return f'{self.id_tipo_producto.nombre} - {self.fecha_elaboracion}'
