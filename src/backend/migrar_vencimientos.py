"""
Script de migracion: parsea los vencimientos en texto libre de tipo_producto
y los convierte en filas normalizadas de condiciones_vencimiento.
Tambien backfillea los productos existentes.

Ejecutar una sola vez: python migrar_vencimientos.py
"""
import os
import re
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'controlStock.settings')
django.setup()

from Inventory.models import (
    TipoProducto, CondicionVencimiento, Producto, calcular_fecha_vencimiento,
)

METODOS = ['refrigerado', 'congelado', 'bodega', 'toppinera']
CAMPOS = {
    'refrigerado': 'vencimiento_refrigerado',
    'congelado': 'vencimiento_congelado',
    'bodega': 'vencimiento_bodega',
    'toppinera': 'vencimiento_toppinera',
}

PAT_DURACION = re.compile(
    r'(\d+)\s*(HORAS|HS|DIAS|DÍAS|DIA|DÍA|MESES|MES|AÑOS|AÑO|ANIOS|ANIO)', re.I)


def normalizar_unidad(texto):
    t = texto.upper()
    if 'HORA' in t or t == 'HS':
        return 'HS'
    if 'DÍA' in t or 'DIA' in t:
        return 'DIAS'
    if 'MES' in t:
        return 'MESES'
    if 'AÑO' in t or 'ANIO' in t or 'AÑOS' in t or 'ANIOS' in t:
        return 'ANIOS'
    return None


def parsear_texto(metodo, texto):
    """Devuelve una lista de dicts con las condiciones que representa el texto."""
    if not texto or not texto.strip():
        return []
    t = texto.strip()
    mayus = t.upper()
    if 'FECHA DE PROVEEDOR' in mayus or 'FECHA DEL PROVEEDOR' in mayus:
        return [{'metodo': metodo, 'especial': 'PROVEEDOR'}]

    condiciones = []
    for parte in re.split(r'/', t):
        parte = parte.strip()
        if not parte:
            continue
        m = PAT_DURACION.search(parte)
        if not m:
            condiciones.append({'metodo': metodo, 'especial': 'FIN_DEL_DIA'})
            continue
        valor = int(m.group(1))
        unidad = normalizar_unidad(m.group(2))
        anotacion = ''
        rango = re.search(r'\((.*?)\)', parte)
        if rango:
            anotacion = rango.group(1).strip()
        resto = parte[m.end():]
        resto = re.sub(r'\(.*?\)', '', resto).strip(' -/')
        if resto:
            anotacion = (anotacion + ' / ' + resto).strip(' /') if anotacion else resto
        condiciones.append({
            'metodo': metodo,
            'duracion_valor': valor,
            'duracion_unidad': unidad,
            'anotacion': anotacion or None,
            'especial': None,
        })
    return condiciones


def parsear_observacion(observacion):
    """Extrae pares (metodo, anotacion) desde el campo observaciones legacy."""
    if not observacion or ':' not in observacion:
        return []
    izq, der = observacion.split(':', 1)
    izq = izq.lower()
    anotacion = der.strip()
    if not anotacion:
        return []
    return [(m, anotacion) for m in METODOS if m in izq]


def clave(cond):
    return (
        cond['metodo'],
        cond.get('especial'),
        cond.get('anotacion'),
        cond.get('duracion_valor'),
        cond.get('duracion_unidad'),
    )


def main():
    CondicionVencimiento.objects.all().delete()

    total_condiciones = 0
    total_especiales = 0

    for tipo in TipoProducto.objects.all():
        observaciones = parsear_observacion(tipo.observaciones)

        vistas = set()
        condiciones_tipo = []

        for metodo in METODOS:
            texto = getattr(tipo, CAMPOS[metodo])
            for cond in parsear_texto(metodo, texto):
                # merge de anotacion desde observaciones
                if not cond.get('anotacion'):
                    for m_obs, anot_obs in observaciones:
                        if m_obs == metodo:
                            cond['anotacion'] = anot_obs
                            break
                k = clave(cond)
                if k in vistas:
                    continue
                vistas.add(k)
                condiciones_tipo.append(cond)

        for cond in condiciones_tipo:
            CondicionVencimiento.objects.create(
                id_tipo_producto=tipo,
                metodo=cond['metodo'],
                anotacion=cond.get('anotacion'),
                duracion_valor=cond.get('duracion_valor'),
                duracion_unidad=cond.get('duracion_unidad'),
                especial=cond.get('especial'),
            )
            total_condiciones += 1
            if cond.get('especial'):
                total_especiales += 1

    # Backfill de productos existentes
    actualizados = 0
    sin_condicion = 0
    for prod in Producto.objects.all():
        conds = CondicionVencimiento.objects.filter(id_tipo_producto=prod.id_tipo_producto_id)
        cond = conds.filter(metodo='congelado', anotacion__isnull=True, especial__isnull=True).first() \
            or conds.filter(anotacion__isnull=True).first() \
            or conds.first()
        if not cond:
            sin_condicion += 1
            continue
        prod.id_condicion = cond
        prod.fecha_vencimiento = calcular_fecha_vencimiento(prod.fecha_elaboracion, cond)
        prod.save(update_fields=['id_condicion', 'fecha_vencimiento'])
        actualizados += 1

    print('=== Migracion completada ===')
    print(f'Tipos de producto procesados: {TipoProducto.objects.count()}')
    print(f'Condiciones creadas:          {total_condiciones} (especiales: {total_especiales})')
    print(f'Productos actualizados:       {actualizados}')
    print(f'Productos sin condicion:      {sin_condicion}')


if __name__ == '__main__':
    main()