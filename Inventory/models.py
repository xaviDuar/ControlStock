from django.db import models
from datetime import timedelta

_DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]


def _sumar_meses(fecha, meses):
    indice = fecha.month - 1 + meses
    anio = fecha.year + indice // 12
    mes = indice % 12 + 1
    dia = min(fecha.day, _DIAS_POR_MES[mes - 1])
    try:
        return fecha.replace(year=anio, month=mes, day=dia)
    except ValueError:
        return fecha.replace(year=anio, month=mes, day=28)


def calcular_fecha_vencimiento(fecha_elaboracion, condicion):
    if not condicion or not fecha_elaboracion:
        return None
    if condicion.especial == 'PROVEEDOR':
        return None
    if condicion.especial == 'FIN_DEL_DIA':
        return fecha_elaboracion
    if condicion.duracion_valor is None or condicion.duracion_unidad is None:
        return None
    if condicion.duracion_unidad == 'HS':
        return fecha_elaboracion + timedelta(hours=condicion.duracion_valor)
    if condicion.duracion_unidad == 'DIAS':
        return fecha_elaboracion + timedelta(days=condicion.duracion_valor)
    if condicion.duracion_unidad == 'MESES':
        return _sumar_meses(fecha_elaboracion, condicion.duracion_valor)
    if condicion.duracion_unidad == 'ANIOS':
        return _sumar_meses(fecha_elaboracion, condicion.duracion_valor * 12)
    return None


class TipoProducto(models.Model):
    id_tipo_producto = models.AutoField(primary_key=True, db_column='id_tipo_producto')
    nombre = models.TextField(unique=True)

    # Campos legacy (solo referencia/exportacion). La fuente de verdad de
    # vencimientos ahora vive en CondicionVencimiento.
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


class CondicionVencimiento(models.Model):
    """
    Duracion de vencimiento para un metodo de conservacion especifico.

    Un mismo tipo de producto puede tener varias condiciones por metodo
    (ej: congelado "bolsa cerrada" 6 MESES / congelado "bolsa abierta" 3 MESES).
    """
    id_condicion = models.AutoField(primary_key=True, db_column='id_condicion')
    id_tipo_producto = models.ForeignKey(
        TipoProducto, on_delete=models.CASCADE, db_column='id_tipo_producto')
    metodo = models.CharField(max_length=20)  # refrigerado|congelado|bodega|toppinera
    anotacion = models.CharField(max_length=150, null=True, blank=True)  # "bolsa cerrada", etc.
    duracion_valor = models.IntegerField(null=True, blank=True)  # 72, 6, 1...
    duracion_unidad = models.CharField(max_length=10, null=True, blank=True)  # HS|DIAS|MESES|ANIOS
    especial = models.CharField(max_length=20, null=True, blank=True)  # null|FIN_DEL_DIA|PROVEEDOR

    class Meta:
        db_table = 'condiciones_vencimiento'
        verbose_name = 'Condicion de vencimiento'
        verbose_name_plural = 'Condiciones de vencimiento'

    def __str__(self):
        if self.especial:
            etiqueta = self.especial.replace('_', ' ')
        else:
            etiqueta = f'{self.duracion_valor} {self.duracion_unidad}'
        if self.anotacion:
            etiqueta += f' ({self.anotacion})'
        return f'{self.id_tipo_producto_id} [{self.metodo}] {etiqueta}'


class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True, db_column='id_producto')
    id_tipo_producto = models.ForeignKey(
        TipoProducto, on_delete=models.CASCADE, db_column='id_tipo_producto')
    id_condicion = models.ForeignKey(
        CondicionVencimiento, on_delete=models.PROTECT, db_column='id_condicion', null=True, blank=True)
    fecha_elaboracion = models.DateField()
    fecha_vencimiento = models.DateField(null=True, blank=True)
    cantidad = models.FloatField(null=True, blank=True)
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    proveedor = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'producto'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def save(self, *args, **kwargs):
        if self.id_condicion_id and self.fecha_elaboracion:
            condicion = CondicionVencimiento.objects.get(pk=self.id_condicion_id)
            self.fecha_vencimiento = calcular_fecha_vencimiento(self.fecha_elaboracion, condicion)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.id_tipo_producto_id} - {self.fecha_elaboracion}'


class Venta(models.Model):
    id_venta = models.AutoField(primary_key=True, db_column='id_venta')
    id_producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_producto')
    fecha = models.DateField()
    cantidad = models.FloatField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'venta'
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'

    def __str__(self):
        return f'Venta {self.id_venta} - {self.id_producto_id}'


class Desperdicio(models.Model):
    id_desperdicio = models.AutoField(primary_key=True, db_column='id_desperdicio')
    id_producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_producto')
    fecha = models.DateField()
    cantidad = models.FloatField()
    motivo = models.CharField(max_length=150, null=True, blank=True)  # vencido|mal estado|error cocina...
    costo_perdido = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'desperdicio'
        verbose_name = 'Desperdicio'
        verbose_name_plural = 'Desperdicios'

    def __str__(self):
        return f'Desperdicio {self.id_desperdicio} - {self.id_producto_id}'