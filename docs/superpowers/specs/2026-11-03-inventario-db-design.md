# Diseño — Persistencia de Inventario y perfil de usuario

**Fecha:** 2026-11-03

**Estado:** borrador para aprobación

**Requerimientos de origen:** `docs/requerimientos/por-implementar/REQ-HOME-01-bienvenida-y-perfil.md`, `REQ-INVENTARIO-01-cargar-lote.md`, `REQ-INVENTARIO-03-consulta-lotes.md`.

## 1. Intención

Ajustar la persistencia Django/SQLite para los nuevos requerimientos de Home e Inventario: unidades por lote, vencimientos calculados pero editables, foto opcional por usuario y alta autenticada de lotes. Actualizar `docs/architecture/ARCHITECTURE.MD` para describir el modelo resultante. Reemplazar los lotes ficticios actuales por diez lotes ficticios completos para que la base activa represente el nuevo esquema.

El catálogo `TipoProducto`/`CondicionVencimiento` se conserva; la operación de datos solo reemplaza filas de `Producto`.

## 2. Alcance

### Incluido

- Campo `unidad_medida` por cada `Producto` (lote), con opciones controladas: `g`, `kg`, `ml`, `l`, `unidad`, `paquete`.
- Mantener `fecha_vencimiento` como valor final guardado. Al crear un lote, si no se proporciona vencimiento, calcularlo según condición; si se proporciona, conservarlo sin que `save()` lo sobrescriba.
- Alta autenticada de lotes por API, limitada a crear/listar/consultar; sin editar ni eliminar lotes por API.
- Modelo opcional `PerfilUsuario` 1:1 con `auth.User`, con imagen cargada desde Django Admin.
- Almacenar la imagen como archivo bajo `MEDIA_ROOT`; SQLite conserva su ruta. `GET /api/auth/me/` expone la URL opcional para el cliente.
- Añadir configuración MEDIA, servir esos archivos en el modo local de ejecución y fijar Pillow en `requirements.txt` para validar imágenes.
- Migraciones compatibles con los once lotes existentes, reemplazo único de esos lotes por diez ejemplos completos, y actualización de arquitectura.
- Aplicar migraciones y reemplazo de datos en la SQLite activa, sin copia de respaldo por decisión explícita del usuario; el reemplazo de lotes se protege con precondiciones y transacción.

### Fuera de alcance

- Implementar las pantallas React de Home, Inventario o Productos.
- Crear usuarios o alterar sus contraseñas.
- Cambiar el catálogo de productos y condiciones de vencimiento.
- Generar, descargar o imprimir rótulos; el carrito y su UI se mantienen fuera de este trabajo.
- Reescribir ventas/desperdicios o convertir cantidades entre unidades.

## 3. Estado actual verificado

- Base activa: `src/backend/db/vencimientos.db` (SQLite).
- 93 tipos de producto, 222 condiciones de vencimiento, 11 lotes, 0 ventas y 0 desperdicios.
- `Producto` ya representa una partida y contiene tipo, condición, elaboración, vencimiento, cantidad, costo y proveedor; no tiene unidad.
- `Producto.save()` siempre recalcula y sobrescribe el vencimiento cuando hay condición, por lo que hoy no persiste un vencimiento manual.
- `ProductoViewSet` es de solo lectura; `/api/auth/me/` devuelve usuario e id.
- No existe perfil de usuario, configuración MEDIA ni dependencia Pillow.
- El usuario confirmó que los datos actuales son ficticios y autorizó reemplazar los lotes actuales por diez lotes ficticios; se conserva el catálogo. La base consultada no tiene ventas ni desperdicios relacionados.

## 4. Diseño propuesto

### 4.1 Lote (`Producto`)

- Añadir `unidad_medida` como campo de texto obligatorio y no nulo en el esquema final, con choices controlados: `g`, `kg`, `ml`, `l`, `unidad`, `paquete`.
- La unidad se guarda en cada lote; no se deriva de `TipoProducto`, no se convierte automáticamente y no se usa una unidad global por nombre.
- No se asigna un default ficticio. Para aplicar el cambio sin adivinar unidades: una primera migración agrega temporalmente el campo nullable; se reemplazan los lotes actuales por los diez ejemplos con unidad; una migración posterior verifica que no queden nulos y convierte el campo en `NOT NULL`. La API de alta y el formulario de Admin lo validan como obligatorio.
- Cambiar `Producto.save()` para calcular vencimiento solo cuando no se haya proporcionado uno. Si `CondicionVencimiento.especial == 'PROVEEDOR'`, no hay cálculo automático y el alta exige fecha manual.
- La duración de la condición se sigue calculando con `calcular_fecha_vencimiento()`. El dato guardado siempre es la fecha final confirmada por el usuario.

### 4.2 Perfil opcional

- Añadir `PerfilUsuario` con `OneToOneField` a `django.contrib.auth.models.User` y `ImageField(upload_to='perfiles/', blank=True, null=True)`.
- El archivo queda en `src/backend/media/perfiles/` (o ruta equivalente bajo `MEDIA_ROOT`); SQLite guarda su ruta. Si no existe perfil o imagen, la API devuelve foto nula y el frontend podrá usar su avatar genérico.
- Agregar un inline al Django Admin de usuarios. No crear carga de foto en el frontend ni vincularla a la contraseña.
- Configurar `MEDIA_URL`/`MEDIA_ROOT`, servir MEDIA en el modo local y agregar Pillow a las dependencias.

### 4.3 API y Admin

- `ProductoSerializer` mantiene la unidad y fechas en su payload.
- Cambiar el viewset de lotes a una combinación que permita `GET` y `POST`, sin `PUT`, `PATCH` ni `DELETE`; conservar `IsAuthenticated` y búsqueda por producto/proveedor.
- Validar tipo y condición compatibles, fecha de elaboración, fecha final de vencimiento, cantidad positiva y unidad permitida. Proveedor/costo siguen siendo opcionales.
- Al crear, aceptar una fecha final manual. Si falta y la condición es calculable, calcularla; si es `PROVEEDOR` y falta fecha, devolver error de validación.
- Añadir unidad a la administración/listado de lotes.
- Incluir `foto_perfil` (URL o nulo) en `/api/auth/me/`; no modificar autenticación ni las contraseñas.

### 4.4 Migración y reemplazo de los lotes ficticios

- Crear migraciones de esquema para unidad y perfil; no incluir en una migración de aplicación una operación que borre lotes, porque se ejecutaría automáticamente en otras instalaciones.
- Aplicar primero la migración que agrega la unidad temporalmente nullable. Ejecutar luego un comando de administración explícito con opción `--replace` que, en una transacción, reemplaza las filas actuales de `Producto` por diez lotes con unidad/fechas/cantidades válidas. Aplicar después la migración que valida que no haya unidades nulas y hace el campo `NOT NULL`.
- La migración final falla con un mensaje claro si encuentra lotes sin unidad; no asigna un valor por defecto. En una base nueva sin lotes, las dos migraciones pueden ejecutarse seguidas.
- Crear ejemplos únicamente a partir de tipos y condiciones ya existentes. Incluir distintas unidades, condiciones con duración calculada y al menos una condición `PROVEEDOR` con fecha manual; usar fechas relativas a la fecha de carga para mostrar estados distintos.
- No borrar ni modificar `TipoProducto` ni `CondicionVencimiento`. La copia permite restaurar la base si la operación falla.

### 4.5 Arquitectura

Actualizar `docs/architecture/ARCHITECTURE.MD` para documentar:

- `PerfilUsuario` y su relación opcional 1:1 con el usuario Django.
- `Producto.unidad_medida`, persistencia del vencimiento final y alta autenticada.
- MEDIA: archivo de foto fuera de SQLite, ruta en la base y necesidad de respaldar ambos.
- API de lotes con lectura/alta y `/api/auth/me/` con foto opcional.
- El reemplazo de ejemplos es una operación puntual, no una migración destructiva recurrente.

## 5. Integridad y restricciones

- Preservar el catálogo de 93 tipos y 222 condiciones.
- El usuario declinó una copia de respaldo porque los datos actuales son ficticios; el comando de reemplazo debe validar relaciones y operar en transacción.
- No asignar unidades por defecto a lotes a partir de nombres o valores numéricos; en el esquema final la unidad es `NOT NULL`.
- Los lotes creados por la API/Admin requieren una unidad y una fecha final de vencimiento.
- Las contraseñas siguen bajo el sistema de autenticación de Django; el perfil solo agrega una referencia opcional a foto.

## 6. Verificación esperada

- Pruebas de modelo para cálculo automático y persistencia de vencimiento manual, unidad y condición `PROVEEDOR`.
- Pruebas de perfil con y sin imagen y de serialización de `foto_perfil`.
- Pruebas API: crear lote autenticado válido, rechazar campos obligatorios inválidos y negar métodos de modificación/eliminación no incluidos.
- `makemigrations --check`, migraciones aplicadas, cero unidades nulas, 10 lotes con unidades/fechas y 93 tipos/222 condiciones conservados.
- Verificar que no queden ventas/desperdicios asociados después del reemplazo (el recuento previo fue cero).
- Ejecutar la suite del backend y actualizar la arquitectura en el mismo cambio.

## 7. Decisiones confirmadas y llamadas

| Punto | Decisión |
|---|---|
| Lotes actuales | Confirmado: reemplazar los 11 lotes ficticios por 10 nuevos. |
| Catálogo | Confirmado: conservar tipos y condiciones existentes. |
| Foto | Confirmado: opcional, administrada en Django Admin, archivo MEDIA y ruta en SQLite. |
| Unidad | Confirmado: por lote, lista controlada `g`, `kg`, `ml`, `l`, `unidad`, `paquete`; todos los lotes tienen unidad. |
| Restricción final | Aclaración tomada de los requerimientos: unidad `NOT NULL`, sin default. La transición en dos migraciones permite reemplazar los datos antes de exigirla. |
| Respaldo SQLite | Decisión actualizada por el usuario: no crear copia; la base contiene datos ficticios. Mantener precondiciones, recuentos y transacción. |
| Dependencias | Llamada técnica: usar `ImageField` y Pillow para carga/validación de imagen. |
| API | Llamada técnica para habilitar requerimientos futuros: permitir solo listar/consultar/crear lotes; sin edición ni eliminación. |
| Datos de ejemplo | Llamada técnica: usar tipos/condiciones del catálogo actual y fechas relativas a la fecha de carga para cubrir estados y unidades. |
