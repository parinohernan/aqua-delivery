# Control GPS — itinerario de vendedores

Documento de especificación funcional y técnica para la nueva funcionalidad de seguimiento de actividad en mapa por empresa.

---

## 1. Documento para el usuario

### ¿Qué es?

Cada **empresa** tendrá una sección (ruta) donde se muestra un **mapa** con la **actividad de cada usuario** (por ejemplo vendedores o repartidores). En el mapa se ve el **itinerario**: el recorrido y los puntos donde ocurrieron hechos relevantes a lo largo del día o el período elegido.

### ¿Para qué sirve?

- Ver **dónde** estuvo cada persona y **cuándo**.
- Entender el **orden** de las visitas o paradas (itinerario).
- Tener trazabilidad operativa sin depender solo del módulo de pedidos.

### ¿Qué se registra al entregar un pedido?

Cuando un usuario **entrega un pedido**, el sistema guarda un registro que incluye:

- **Tipo de evento** (texto libre; por ejemplo “Entrega”, “Carga de combustible”, “Check”, etc.).
- **Número de pedido** (cuando aplique; puede quedar vacío si el evento no está ligado a un pedido).
- **Usuario** que realizó la acción.
- **Fecha y hora** del hecho.
- **Ubicación**: latitud y longitud.

Así el mapa puede mostrar **todos** los tipos de actividad, no solo entregas.

### Relación con los pedidos

Los eventos **no están obligatoriamente atados** a un pedido concreto. El mismo mecanismo sirve para:

- Entregas (con número de pedido).
- Otros hechos operativos: **carga de combustible**, **check** de ruta, paradas administrativas, etc.

El campo **evento** es **texto libre**: la empresa o el usuario pueden describir lo que ocurrió. El **número de pedido** es opcional según el caso.

### Pantalla `/gps` (nombre de ruta orientativo)

En la ruta prevista **`/gps`** (o equivalente acordado con el producto):

- Se muestra el **mapa** con la actividad de **cada vendedor** (o usuario con rol adecuado).
- Se visualiza el **itinerario** (línea o secuencia de puntos ordenados en el tiempo).
- Será posible filtrar por usuario, fecha y, si aplica, por tipo de evento.

---

## 2. Documento para el programador

### Objetivo

Implementar el registro de **eventos georreferenciados** por usuario y empresa, y una vista de **mapa** que muestre el **itinerario** por vendedor. Los eventos son **polivalentes**: no modelar solo “entrega de pedido”; el vínculo con pedidos es **opcional**.

### Modelo de datos (nueva tabla)

Tabla orientativa (ajustar nombres a convención del proyecto: `snake_case` en DB, etc.):

| Campo            | Tipo sugerido | Notas |
|-----------------|----------------|--------|
| `id`            | UUID / bigint PK | |
| `empresa_id`    | FK → empresas   | Multi-tenant: todo filtrado por empresa. |
| `usuario_id`    | FK → usuarios   | Quién generó el evento. |
| `evento`        | texto           | **Libre**: “Entrega”, “Combustible”, “Check”, etc. |
| `numero_pedido` | texto nullable  | Opcional; null si no aplica. |
| `fecha`         | date / timestamp | Momento del evento (unificar criterio: UTC en DB, local en UI). |
| `hora`          | time / parte de `fecha` | Si `fecha` es `timestamptz`, `hora` puede derivarse o almacenarse explícito según diseño. |
| `latitud`       | decimal         | WGS84. |
| `longitud`      | decimal         | WGS84. |
| `creado_en`     | timestamp       | Auditoría opcional. |

**Reglas:**

- **No** FK obligatoria a la tabla de pedidos: el enlace es por **texto** (`numero_pedido`) o campo opcional, según cómo estén modelados los pedidos hoy (evitar acoplamiento rígido).
- Índices recomendados: `(empresa_id, usuario_id, fecha)`, `(empresa_id, fecha)` para consultas del mapa.

### Flujo de escritura

1. **Al entregar un pedido** (flujo existente o nuevo paso en la app móvil/web): además de cerrar el pedido, **insertar fila** en la nueva tabla con `evento`, `numero_pedido`, `usuario`, fecha/hora, `lat`/`long`.
2. **Otros eventos** (combustible, check, etc.): mismos endpoints o acciones dedicadas que inserten filas con `evento` descriptivo y `numero_pedido` null si no hay pedido.

### API (orientativo)

- `POST /api/.../eventos-gps` — crear evento (body: evento, numero_pedido opcional, lat, long, timestamp o fecha+hora).
- `GET /api/.../eventos-gps?usuario_id=&desde=&hasta=` — listado filtrado por empresa (desde token/sesión), para pintar mapa e itinerario.

Autorización: solo roles que correspondan (ej. admin / supervisor ve todos los usuarios de la empresa; vendedor solo su propia traza si aplica política de privacidad).

### Frontend (React)

- **Ruta** `/gps` dentro del layout autenticado (como `/mapa`, `/rutas`), registrada en `ROUTES` y navegación según producto.
- Componente de **mapa** (reutilizar Leaflet u otra lib ya usada en `MapView` si conviene).
- Capas: marcadores por evento, **polyline** u orden temporal para **itinerario** por `usuario_id`.
- Filtros: usuario, rango de fechas.

### Consideraciones técnicas

- **Precisión y permisos**: geolocalización del navegador o app; manejo de errores si el usuario deniega GPS.
- **Offline** (si aplica al proyecto): cola de eventos y sincronización — alineado con patrón IndexedDB existente si lo hay.
- **Privacidad**: documentar retención y quién puede ver las coordenadas.

### Criterios de aceptación (resumen)

- [ ] Tabla y API de eventos georreferenciados por empresa y usuario.
- [ ] Registro automático o asistido al marcar entrega de pedido con lat/long.
- [ ] Posibilidad de registrar eventos sin pedido (`numero_pedido` vacío, `evento` libre).
- [ ] Vista `/gps` con mapa e itinerario por vendedor/usuario y filtros básicos.

---

*Última actualización: especificación inicial — implementación pendiente.*
