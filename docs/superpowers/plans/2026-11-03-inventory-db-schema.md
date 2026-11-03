# Inventario y perfil: plan de implementación

> **Para agentes implementadores:** seguir este plan tarea por tarea y usar TDD. Las operaciones sobre la SQLite activa son secuenciales; respetar las precondiciones y la transacción de la última tarea.

**Objetivo:** adaptar el backend y SQLite a unidades por lote, vencimiento manual/sugerido y foto opcional de usuario; reemplazar el inventario ficticio actual por diez partidas completas y documentar la arquitectura resultante.

**Arquitectura:** `Producto` sigue siendo la entidad lote y almacena la unidad propia, cantidad y fecha final. Un perfil 1:1 con el usuario Django guarda una foto opcional como archivo MEDIA. La API permite consultar y crear lotes, y `me` expone la foto. La sustitución de ejemplos se ejecuta con un comando explícito y no se incorpora como migración destructiva.

**Stack:** Django 6.0.5, DRF 3.17.1, SQLite3, Python 3.13, Django Admin, Pillow.

**Spec:** `docs/superpowers/specs/2026-11-03-inventario-db-design.md`

## Restricciones globales

- Preservar los 93 `TipoProducto` y 222 `CondicionVencimiento` actuales.
- El inventario activo termina con exactamente 10 partidas ficticias, todas con condición, elaboración, vencimiento final, cantidad positiva y unidad.
- Unidades permitidas: `g`, `kg`, `ml`, `l`, `unidad`, `paquete`; cada lote conserva su propia unidad.
- No asignar unidades ficticias por defecto a datos heredados.
- La fecha final de vencimiento puede ser calculada o ingresada manualmente; el `save()` no debe sobrescribir un valor manual.
- Para `PROVEEDOR`, el vencimiento es manual y obligatorio.
- La foto es opcional, `ImageField`, asociada 1:1 a `auth.User`, administrada en Django Admin, almacenada bajo MEDIA y con su ruta en SQLite.
- API de lotes: lectura y alta autenticadas; no agregar actualización o eliminación.
- No implementar frontend React ni generación/impresión de rótulos.
- No crear copia de la SQLite por decisión explícita del usuario; antes del reemplazo, verificar recuentos/relaciones y ejecutar la sustitución en una transacción.
- No borrar tipos/condiciones. El reemplazo de lotes debe abortar si aparecen ventas/desperdicios vinculados.
- No hacer commit sin pedido explícito.

## Review Focus

- Una fecha manual debe sobrevivir `Producto.save()` y al `POST`; testear cálculo automático, sobreescritura y condición `PROVEEDOR` en la tarea 1/2.
- Las unidades deben ser del lote, permitidas y no nulas en el esquema final; testear validación y migración final en las tareas 1/2.
- La foto puede no existir; `/api/auth/me/` debe devolver `null` sin romper y una URL al existir, en la tarea 3.
- `POST /api/productos/` no debe habilitar `PUT`, `PATCH` ni `DELETE`; testear métodos y autenticación en la tarea 3.
- La orden de reemplazo debe requerir `--replace`, operar en transacción, conservar catálogo y negarse si hay ventas/desperdicios relacionados, en la tarea 4.

---

### Task 1: Pruebas del modelo de lote y perfil

**Archivos:**
- Modificar: `src/backend/Inventory/tests.py`
- Probar: `src/backend/Inventory/models.py`
- Modificar: `requirements.txt`

**Interfaces:**
- Usa: `Producto`, `TipoProducto`, `CondicionVencimiento`, `calcular_fecha_vencimiento()`.
- Produce: pruebas que fijan `unidad_medida`, vencimiento final manual y `PerfilUsuario` opcional.

- [ ] **Paso 1: Agregar Pillow como dependencia de prueba/ejecución**
  - Ejecutar `entorno\Scripts\python.exe -m pip install Pillow`, fijar el resultado exacto de `entorno\Scripts\python.exe -m pip freeze` en `requirements.txt` y comprobar `import PIL`.
- [ ] **Paso 2: Escribir pruebas fallidas**
  - `test_producto_guarda_unidad_permitida_por_lote`: admite cada opción permitida y rechaza otra.
  - `test_producto_calcula_vencimiento_si_no_se_proporciona`: para condición de 5 días, fecha de elaboración + 5 días.
  - `test_producto_preserva_vencimiento_manual`: un vencimiento enviado no se reemplaza al guardar.
  - `test_producto_preserva_fecha_manual_para_proveedor`: condición `PROVEEDOR` con fecha manual conserva esa fecha.
  - `test_perfil_usuario_puede_no_tener_foto`: perfil sin foto válido.
- [ ] **Paso 3: Ejecutar las pruebas para confirmar el fallo**

Run: `entorno\Scripts\python.exe manage.py test Inventory.tests -v 2` desde `src/backend`.

Expected: falla por campo/unidad, sobrescritura de fecha y modelo de perfil aún inexistentes.

---

### Task 2: Modelos, migraciones y restricciones finales

**Archivos:**
- Modificar: `src/backend/Inventory/models.py`
- Crear: `src/backend/Inventory/migrations/0003_producto_unidad_perfil.py`
- Crear: `src/backend/Inventory/migrations/0004_producto_campos_obligatorios.py`
- Test: `src/backend/Inventory/tests.py`

**Interfaces:**
- Consume: pruebas de la tarea 1.
- Produce: `Producto.unidad_medida`, `PerfilUsuario(usuario, foto_perfil)` y comportamiento de `save()` que calcula solo si falta fecha.

- [ ] **Paso 1: Implementar choices de unidad**
  - Definir `UNIDADES_MEDIDA` con los seis valores aprobados.
  - Agregar `unidad_medida` como nullable únicamente en la migración transitoria 0003, sin default.
  - El modelo final debe tener `null=False`, `blank=False`.
- [ ] **Paso 2: Implementar perfil opcional**
  - Agregar `PerfilUsuario` con `OneToOneField(settings.AUTH_USER_MODEL, related_name='perfil')` e `ImageField(upload_to='perfiles/', blank=True, null=True)`.
- [ ] **Paso 3: Preservar vencimiento manual**
  - En `Producto.save()`, calcular solo cuando `fecha_vencimiento is None`; si existe fecha manual, no sobrescribir.
- [ ] **Paso 4: Escribir migraciones**
  - 0003 agrega unidad nullable y `PerfilUsuario` sin borrar datos.
  - 0004 usa un `RunPython` de validación para abortar con mensaje claro si quedan lotes sin unidad/condición/fecha/cantidad; después fija unidad, condición, vencimiento y cantidad como no nulos y agrega `CheckConstraint` llamados `producto_cantidad_mayor_cero` (`cantidad > 0`) y `producto_unidad_medida_valida` (unidad dentro de `UNIDADES_MEDIDA`).
- [ ] **Paso 5: Ejecutar pruebas y detectar cambios de modelo no migrados**

Run: `entorno\Scripts\python.exe manage.py test Inventory.tests -v 2` y `entorno\Scripts\python.exe manage.py makemigrations --check --dry-run`.

Expected: pruebas verdes y `No changes detected`.

---

### Task 3: API de alta, perfil, Admin y MEDIA

**Archivos:**
- Modificar: `src/backend/Inventory/serializers.py`
- Modificar: `src/backend/Inventory/api.py`
- Modificar: `src/backend/Inventory/admin.py`
- Modificar: `src/backend/controlStock/settings.py`
- Modificar: `src/backend/controlStock/urls.py`
- Crear/modificar: `src/backend/Inventory/test_api.py`

**Interfaces:**
- Consume: `Producto.unidad_medida`, `PerfilUsuario` y migraciones de la tarea 2.
- Produce: `POST /api/productos/` autenticado y `foto_perfil` opcional en `/api/auth/me/`.

- [ ] **Paso 1: Escribir pruebas de API fallidas**
  - `test_post_producto_autenticado_crea_lote_con_unidad_y_fecha`.
  - `test_post_producto_rechaza_unidad_o_cantidad_invalidas`.
  - `test_post_proveedor_requiere_fecha_vencimiento_manual`.
  - `test_producto_api_no_permite_put_patch_delete`.
  - `test_me_devuelve_foto_null_y_url_cuando_corresponde`.
  - `test_media_url_resolves_to_django_file_server` con `DEBUG=True`, para asegurar que MEDIA se resuelve antes del catch-all de la SPA.
- [ ] **Paso 2: Ejecutar para confirmar fallos**

Run: `entorno\Scripts\python.exe manage.py test Inventory.test_api -v 2`.

Expected: fallos por endpoint, validación de unidad y perfil aún no expuestos.

- [ ] **Paso 3: Implementar el serializer de lote**
  - Validar que la condición pertenezca al tipo seleccionado.
  - Exigir fecha de elaboración, vencimiento final, cantidad positiva y unidad permitida.
  - Si no llega fecha final, calcularla cuando la condición permita; si es `PROVEEDOR`, rechazar sin fecha manual.
- [ ] **Paso 4: Limitar métodos del viewset**
  - Usar `GenericViewSet` con `ListModelMixin`, `RetrieveModelMixin` y `CreateModelMixin`; mantener búsqueda por nombre/proveedor y `IsAuthenticated`.
- [ ] **Paso 5: Exponer foto de usuario**
  - `/api/auth/me/` agrega `foto_perfil` como URL absoluta o `null`, tolerando que no exista perfil.
- [ ] **Paso 6: Configurar Django Admin y MEDIA**
  - Agregar inline opcional de perfil al `UserAdmin` y mostrar unidad en `ProductoAdmin`.
  - Definir `MEDIA_URL='/media/'`, `MEDIA_ROOT=BASE_DIR / 'media'`; servir MEDIA bajo `DEBUG`.
- [ ] **Paso 7: Verificar API y configuración**

Run: `entorno\Scripts\python.exe manage.py test Inventory.test_api -v 2`.

Expected: todas las pruebas verdes; `/api/productos/` no ofrece métodos de modificación/eliminación.

---

### Task 4: Comando protegido para reemplazar inventario ficticio

**Archivos:**
- Crear: `src/backend/Inventory/management/__init__.py`
- Crear: `src/backend/Inventory/management/commands/__init__.py`
- Crear: `src/backend/Inventory/management/commands/replace_inventory_demo.py`
- Crear/modificar: `src/backend/Inventory/test_commands.py`

**Interfaces:**
- Consume: modelos y condiciones válidas de la tarea 2.
- Produce: `manage.py replace_inventory_demo --replace`, que reemplaza lotes solo si se autoriza explícitamente.

- [ ] **Paso 1: Escribir pruebas fallidas del comando**
  - Sin `--replace`, no borra ni agrega filas.
  - Con `--replace`, crea exactamente diez lotes con unidad, condición y fechas válidas; conserva todos los tipos y condiciones.
  - Con `Venta` o `Desperdicio` relacionado, aborta y no modifica nada.
  - La comprobación de ventas/desperdicios ocurre dentro de la misma transacción que borra/crea lotes.
  - La ejecución se realiza en una transacción.
- [ ] **Paso 2: Ejecutar pruebas para confirmar fallos**

Run: `entorno\Scripts\python.exe manage.py test Inventory.test_commands -v 2`.

Expected: fallos porque el comando aún no existe.

- [ ] **Paso 3: Implementar comando idempotente y explícito**
  - Buscar tipos/condiciones por nombre, método y anotación; no usar IDs fijos.
  - Crear diez ejemplos con distintas unidades, condiciones calculables y condición `PROVEEDOR` con fecha manual, fechas relativas a `timezone.localdate()`.
  - Dentro de `transaction.atomic()`, bloquear las filas de `Producto` compatibles, comprobar que no haya ventas/desperdicios, resolver catálogo y después reemplazar únicamente filas `Producto`; solo ejecutar con `--replace`.
- [ ] **Paso 4: Ejecutar pruebas del comando**

Run: `entorno\Scripts\python.exe manage.py test Inventory.test_commands -v 2`.

Expected: todos los casos verdes y el catálogo intacto.

---

### Task 5: Migración y actualización de la base activa

**Archivos/datos:**
- Base: `src/backend/db/vencimientos.db`

**Interfaces:**
- Consume: migraciones 0003/0004 y comando `replace_inventory_demo --replace`.
- Produce: SQLite con diez lotes completos, unidades no nulas y catálogo conservado.

- [ ] **Paso 1: Verificar precondiciones de la base activa**
  - Consultar con ORM los totales de tipos, condiciones, lotes, ventas y desperdicios; proceder solo si el estado sigue siendo 93, 222, 11, 0 y 0 respectivamente.
  - Detenerse si aparecen ventas/desperdicios u otro cambio inesperado; el usuario declinó respaldo y no se deben borrar relaciones nuevas.
- [ ] **Paso 2: Aplicar solo migración transitoria**

Run desde `src/backend`: `entorno\Scripts\python.exe manage.py migrate Inventory 0003_producto_unidad_perfil`.

Expected: campo de unidad temporalmente nullable y perfil creado, sin borrar filas existentes.

- [ ] **Paso 3: Reemplazar una sola vez los lotes**

Run: `entorno\Scripts\python.exe manage.py replace_inventory_demo --replace`.

Expected: diez lotes; catálogo igual; ventas/desperdicios siguen en cero.

- [ ] **Paso 4: Aplicar migraciones restantes**

Run: `entorno\Scripts\python.exe manage.py migrate`.

Expected: unidad/condición/fecha/cantidad quedan no nulos; los datos cumplen constraints.

- [ ] **Paso 5: Verificar datos activos**
  - Consultar con ORM: `Producto.count() == 10`; cero `unidad_medida`, `id_condicion`, `fecha_vencimiento` o `cantidad` nulos; cantidad positiva; 93 tipos y 222 condiciones; 0 ventas/desperdicios.
  - El comando de reemplazo es transaccional: si falla durante la sustitución, se revierten sus borrados/inserciones. Si la migración final falla después, detenerse y corregirla sin ejecutar otro reemplazo; no crear una copia de respaldo por decisión del usuario.

---

---

### Task 6: Actualizar arquitectura

**Archivos:**
- Modificar: `docs/architecture/ARCHITECTURE.MD`

**Interfaces:**
- Consume: modelos/API verificados de las tareas 2 y 3 y estado final de la SQLite de la tarea 5.
- Produce: arquitectura coherente con `PerfilUsuario`, unidad por lote, MEDIA, endpoint de alta y comando de reemplazo puntual.

- [ ] **Paso 1: Actualizar diagrama y descripción de datos**
  - Añadir relación opcional `User 1—1 PerfilUsuario`.
  - Actualizar `Producto` con unidad, campos obligatorios y vencimiento final calculado/manual.
  - Indicar los diez lotes ficticios en la base actual y preservar los recuentos del catálogo.
- [ ] **Paso 2: Actualizar APIs, MEDIA y ejecución**
  - Documentar GET/POST de lotes, `/api/auth/me/` con foto opcional, `MEDIA_ROOT` y respaldos de la carpeta MEDIA además de SQLite.
  - Aclarar que los datos de ejemplo se reemplazan con un comando explícito, no mediante migración destructiva.
- [ ] **Paso 3: Verificar referencias y esquema**

Run: `entorno\Scripts\python.exe manage.py check` y `entorno\Scripts\python.exe manage.py makemigrations --check --dry-run`.

Expected: `System check identified no issues` y `No changes detected`.

---

## Orden de ejecución recomendado

1. Tarea 1 y 2 (TDD, modelos/migraciones).
2. Tarea 3 (API/Admin/MEDIA/Pillow).
3. Tarea 4 (comando de reemplazo y pruebas en base de test).
4. Task 5 en la SQLite activa, con precondiciones verificadas.
5. Task 6 (arquitectura basada en el estado final ya verificado).

No ejecutar Task 5 hasta que Tasks 1–4 estén verdes; no documentar cifras finales hasta que la base activa haya pasado su verificación.
