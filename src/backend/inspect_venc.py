import sqlite3
conn = sqlite3.connect(r'C:\Users\Usuario\Documents\proyectoStock\vencimientos.db')
cur = conn.cursor()

print('=== Valores distintos por columna de vencimiento ===')
for col in ['vencimiento_refrigerado', 'vencimiento_congelado', 'vencimiento_bodega', 'vencimiento_toppinera']:
    cur.execute(f'SELECT DISTINCT "{col}" FROM tipo_producto WHERE "{col}" IS NOT NULL ORDER BY "{col}"')
    vals = [r[0] for r in cur.fetchall()]
    print(f'\n{col} ({len(vals)} valores distintos):')
    for v in vals:
        print(f'  "{v}"')

print('\n=== Observaciones distintas ===')
cur.execute('SELECT DISTINCT observaciones FROM tipo_producto WHERE observaciones IS NOT NULL')
for r in cur.fetchall():
    print(f'  "{r[0]}"')

conn.close()