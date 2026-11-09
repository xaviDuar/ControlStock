# REQ-HOME-02 — Paneles de vencimientos y desperdicio (placeholders)

**Mockup:** `docs/pantallas.pen` → frame **`Home`** (nodo `kibN3`)
**Specs vigentes:** [`consultainventario.md`](../../specs/por-aprobar/consultainventario.md), [`consultadesperdicios.md`](../../specs/por-aprobar/consultadesperdicios.md)
**Archivos implicados:** página del Home en `src/frontend/src/pages/`, componentes de los paneles del Home

---

## 1. Objetivo

Componer en el Home los dos recuadros de la parte inferior del mockup —próximos vencimientos y últimos desperdicios— dejándolos listos como estructura, con un aviso de “por implementar próximamente” hasta que se implementen la v2 de vencimientos y la v2 de desperdicio, que los llenarán con datos.

## 2. Estado actual

- No existe el Home ni sus paneles inferiores.
- Los datos de lotes y desperdicios están disponibles en la API, pero el Home no los consulta.
- El mockup muestra dos recuadros: uno de próximos vencimientos y otro de últimos desperdicios.

## 3. Estado objetivo (qué cambia)

| Elemento (mockup)                                     | Contenido                                                              | Estado          |
| ----------------------------------------------------- | ---------------------------------------------------------------------- | --------------- |
| Recuadro de próximos vencimientos (abajo, izquierda) | Estructura del recuadro con el aviso “por implementar próximamente” | **Nuevo** |
| Recuadro de últimos desperdicios (abajo, derecha)    | Estructura del recuadro con el aviso “por implementar próximamente” | **Nuevo** |
| Consulta de datos de vencimientos y desperdicios      | No se consulta la API en esta etapa                                    | **Nuevo** |
| Composición de dos recuadros inferiores              | Se mantiene como estructura para la v2                                 | Se mantiene     |

## 4. Requerimientos funcionales

| ID     | Requerimiento                                                                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-2.1 | Debajo del saludo, el Home muestra dos recuadros: próximos vencimientos a la izquierda y últimos desperdicios a la derecha, según el mockup. |
| RF-2.2 | Cada recuadro muestra el aviso “por implementar próximamente” en lugar de datos.                                                             |
| RF-2.3 | El Home no consulta la API de vencimientos ni la de desperdicios para estos recuadros en esta etapa.                                            |
| RF-2.4 | No se muestran datos reales ni ficticios de vencimientos o desperdicios dentro de los recuadros.                                                |
| RF-2.5 | La estructura de los recuadros queda preparada para recibir los datos de la v2 de vencimientos sin cambiar la composición.                     |

## 5. Requerimientos visuales / no funcionales

| ID      | Requerimiento                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| RNF-2.1 | Los dos recuadros siguen la disposición del frame `Home` del mockup y la estética pixel-art de la aplicación.                  |
| RNF-2.2 | El aviso “por implementar próximamente” se lee con claridad dentro de cada recuadro.                                             |
| RNF-2.3 | Los recuadros respetan la proporción del mockup: el panel de próximos vencimientos es más ancho que el de últimos desperdicios. |

## 6. Casos de uso

### UC-02.1 — Ver los paneles del Home

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **Actor**          | Empleado autenticado                                     |
| **Objetivo**       | Ver los recuadros de vencimientos y desperdicio del Home |
| **Precondiciones** | Sesión iniciada y Home visible                          |
| **Disparador**     | El usuario abre el Home                                  |

**Flujo principal:**

1. El Home muestra la bienvenida (REQ-HOME-01).
2. Debajo, el Home muestra el recuadro de próximos vencimientos con el aviso “por implementar próximamente”.
3. El Home muestra el recuadro de últimos desperdicios con el mismo aviso.
4. El usuario puede seguir navegando a las otras secciones.

**Flujos alternativos y excepciones:**

| # | Caso                                | Resultado                                                                                              |
| - | ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1 | La ventana es angosta               | Los recuadros se ubican apilados manteniendo el orden del mockup                                       |
| 2 | Se implementa la v2 de vencimientos | Los recuadros muestran los datos reales y desaparece el aviso (fuera de alcance de este requerimiento) |

**Postcondiciones:** El usuario ve los dos recuadros con el aviso de funcionalidad futura.

## 7. Criterios de aceptación

| ID     | Criterio (Given / When / Then)                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CA-2.1 | **Given** el Home cargado, **when** se mira la zona inferior, **then** aparecen dos recuadros: próximos vencimientos y últimos desperdicios.         |
| CA-2.2 | **Given** cualquiera de los dos recuadros, **when** carga el Home, **then** muestra el aviso “por implementar próximamente”.                        |
| CA-2.3 | **Given** el Home en esta etapa, **when** carga el Home, **then** no se realiza ninguna llamada a la API de vencimientos ni de desperdicios.           |
| CA-2.4 | **Given** los dos recuadros, **when** se los compara con el mockup, **then** conservan la disposición y estética pixel-art del frame `Home`.       |
| CA-2.5 | **Given** un usuario autenticado, **when** carga el Home, **then** los recuadros no muestran datos reales ni ficticios de vencimientos o desperdicios. |

## 8. Fuera de alcance

- Mostrar lotes, fechas o alertas de vencimiento en el Home.
- Mostrar registros o métricas de desperdicio.
- Consultar la API desde los paneles.
- Modificar la API o el modelo de datos.

## 9. Decisiones

| # | Punto                      | Decisión                                                                                                                    |
| - | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1 | Contenido de los recuadros | Confirmado (usuario): ambos muestran el aviso “por implementar próximamente”; los datos llegan con la v2 de vencimientos. |
| 2 | Disposición               | Confirmado (usuario): dos recuadros en la parte inferior del Home, siguiendo el mockup.                                      |
| 3 | Consulta de API            | Decisión (mi llamada): al no mostrar datos, los recuadros no consultan la API; la estructura queda preparada para la v2.    |
