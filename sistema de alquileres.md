# Sistema de Alquileres

Este documento incluye:
- Guía de usuario (uso operativo).
- Guía de programador (arquitectura y mantenimiento técnico).

---

## Guía de Usuario

### 1) ¿Para qué sirve?
El módulo de alquileres permite registrar equipos alquilados a clientes (por ejemplo, dispenser frío/calor), generar cada mes un **pedido pendiente** por la cuota (producto **Cuota de alquiler**) y dejar constancia del período en `cliente_alquileres_cargos`. **No** suma automáticamente al saldo del cliente: la deuda se define al **entregar** el pedido con el flujo habitual de pedidos.

### 2) Alta de un alquiler
Desde Clientes:
1. Abrir el cliente.
2. Entrar a **Alquileres**.
3. Completar:
   - **Tipo** (texto libre, por ejemplo `Dispenser frio calor`).
   - **Marca** (opcional).
   - **Número de serie** (opcional).
   - **Observación** (opcional).
   - **Monto mensual**.
   - **Fecha de inicio**.
4. Guardar.

**Al guardar el alquiler** el sistema hace tres cosas en una sola operación:
1. Registra el contrato (`cliente_alquileres`).
2. Genera la **primera cuota** del **mes calendario actual** (período `YYYY-MM` del día de alta), con **fecha programada** igual a la **fecha en que se crea** el contrato (día de hoy en el servidor).
3. Crea un **pedido pendiente** (`pendient`) con un ítem del producto **Cuota de alquiler** por el monto mensual. El saldo del cliente **no** cambia hasta que alguien entregue/cobre ese pedido como con cualquier otro pedido.

### 2.1) Cómo y cuándo se cobran las cuotas (meses siguientes)

- Cada cuota corresponde a un **mes calendario** (período `YYYY-MM`, por ejemplo `2026-03`).
- La **primera cuota** se cobra **el día del alta**, como se indicó arriba.
- A partir del **segundo mes** incluido, el **día de cobro** de ese mes es el **día de la fecha de inicio** del alquiler (`diaCobro`). Si ese mes no tiene ese número de día (por ejemplo día 31 en abril), se usa el **último día del mes**.
- El sistema intenta generar **como mucho un cargo por alquiler y por mes** (no se duplica el mismo período). Si el job mensual intentara volver a cobrar el mismo mes que ya se liquidó al alta, ese intento se descarta (clave única).
- Cada vez que se **genera** una cuota (alta o job), se crea un **pedido pendiente** con **Cuota de alquiler** por ese monto.
- El cobro automático corre cuando un proceso diario (o una ejecución manual) corre **en una fecha ya igual o posterior a ese día de cobro dentro del mes**. Hasta ese día del mes, ese período **no** se factura por el job (salvo la primera cuota al alta, que no depende de `diaCobro`).
- **Momento técnico:** en el servidor corre un job **al menos una vez por día** (intervalo ~24 h desde el arranque del backend; no está garantizado exactamente a las 00:00 en punto). Si necesitás horario fijo medianoche, habría que ajustar despliegue (cron) o el scheduler.

**Ejemplo A — mismo día de mes todos los meses**  
Alquiler con fecha de inicio **10 de marzo de 2026** → día de cobro **10**.  
- Al crear el alquiler el **5 de marzo**, la **primera cuota** es del período **marzo-2026**, con fecha programada **5 de marzo** (día del alta).  
- La cuota de **abril-2026** la evaluará el job cuando corra el **10 de abril o después**, etc.

**Ejemplo B — mes corto (fin de mes)**  
Alquiler con día de cobro **31** (sale de la fecha de inicio).  
- En **marzo** el cargo programado por el job cae el **31**.  
- En **abril** (30 días) el “día 31” no existe → se cobra el **30 de abril**.  
- En **febrero** se cobra el **28** (o **29** en año bisiesto).

### 3) Múltiples alquileres por cliente
Un cliente puede tener más de un alquiler activo al mismo tiempo.

### 4) Cancelar un alquiler
Desde la lista de alquileres del cliente:
1. Pulsar **Cancelar** en el alquiler.
2. Confirmar acción.

El alquiler queda cancelado (no se elimina historial) y deja de generar cargos nuevos.

### 5) Contrato/resumen para compartir
Cada alquiler tiene:
- **Copiar resumen**: copia texto para enviar por chat.
- **Enviar por WhatsApp**: abre WhatsApp con el resumen prellenado.

### 6) Ver impacto en deuda
La cuota mensual:
- **No** aumenta por sí sola el `saldo` del cliente.
- Se registra el período en **cargos de alquiler** (visible en estado de cuenta como detalle de alquiler).
- Aparece como **pedido pendiente** con producto **Cuota de alquiler**; al **entregar** ese pedido, el saldo se actualiza según el tipo de pago que use el reparto (igual que el resto de pedidos).

---

## Guía del Programador

### 1) Resumen de diseño
Se implementó enfoque híbrido:
- Las cuotas generan **pedidos pendientes**; el impacto en `clientes.saldo` ocurre al **entregar** el pedido (mismo modelo que el resto de la app).
- Estructurado por capas para evolución futura.

Capas:
- **Dominio**: reglas de calendario e idempotencia.
- **Aplicación**: casos de uso (crear, cancelar, generar cargos).
- **Infraestructura**: repositorios SQL, gateway de saldo (validación de cliente en alta) y aplicación de cargo + pedido.
- **API**: rutas Express.

### 2) Estructura de archivos
- `backend/modules/alquileres/domain/alquilerRules.js`
- `backend/modules/alquileres/domain/alquilerConstants.js` (descripción del producto sintético **Cuota de alquiler**)
- `backend/modules/alquileres/application/createAlquiler.js`
- `backend/modules/alquileres/application/cancelAlquiler.js`
- `backend/modules/alquileres/application/generateMonthlyCharges.js`
- `backend/modules/alquileres/infrastructure/alquilerRepositorySql.js`
- `backend/modules/alquileres/infrastructure/chargeRepositorySql.js`
- `backend/modules/alquileres/infrastructure/clienteSaldoGatewaySql.js`
- `backend/modules/alquileres/infrastructure/alquilerChargeWithPedidoSql.js` (cargo en tabla de cargos + pedido `pendient` + ítem; sin tocar `clientes.saldo`)
- `backend/modules/alquileres/index.js`
- `backend/routes/alquileres.js`
- `backend/jobs/alquileresScheduler.js`

Frontend:
- `reactfront/src/features/clientes/components/ClienteAlquileresModal.tsx`
- `reactfront/src/features/clientes/services/clientesService.ts`
- `reactfront/src/services/api/endpoints.ts`
- `reactfront/src/types/entities.d.ts`

### 3) Base de datos
Migraciones:
- `backend/migrations/create_alquileres_tables.sql`
- `backend/migrations/alter_alquileres_descriptivo.sql`

Tablas:
- `cliente_alquileres`
  - `tipo` es texto libre.
  - `marca`, `numeroSerie`, `observacion` opcionales.
- `cliente_alquileres_cargos`
  - Guarda cargos por período.
  - Índice único: `(codigoEmpresa, alquilerId, periodo)` para evitar duplicados.
- `productos`: por empresa se crea bajo demanda un producto activo con `descripcion = 'Cuota de alquiler'` (ver `alquilerConstants.js`).
- `pedidos` / `pedidositems`: un registro por cada cuota generada; estado **`pendient`** (mismo criterio que `POST /api/pedidos`). No se descuenta stock del producto sintético **Cuota de alquiler** al insertar el ítem desde este módulo.

### 4) Endpoints
- `POST /api/alquileres`  
  Crea alquiler, primera cuota del mes actual y pedido asociado (requiere token con `vendedorId`).
- `PATCH /api/alquileres/:id/cancelar`  
  Cancela alquiler.
- `POST /api/alquileres/cobros/ejecutar`  
  Ejecuta cobro mensual manual.
- `GET /api/clientes/:id/alquileres`  
  Lista alquileres del cliente.
- `GET /api/clientes/:id/estado-cuenta`  
  Devuelve movimientos incluyendo cargos de alquiler.

### 5) Scheduler
Archivo:
- `backend/jobs/alquileresScheduler.js`

Comportamiento:
- Corre en intervalos de ~24 h (desde el arranque del proceso; no es cron a medianoche salvo que el host lo coordine).
- Busca empresas con alquileres activos.
- Ejecuta generación de cargos por período (`GenerateMonthlyCharges`).
- Para armar el pedido usa el **primer vendedor** de la empresa (`ORDER BY codigo ASC LIMIT 1`). Si no hay vendedores, registra el cargo en `cliente_alquileres_cargos` pero **no** crea pedido (warning en consola).

**Alta de alquiler:** `CreateAlquiler` persiste el contrato y llama a la misma rutina de **cargo + pedido pendiente** que el job, con período = `toPeriod(hoy)` y `fechaProgramada` = `formatLocalYMD(hoy)`.

### 6) Reglas clave de negocio
- Primera cuota: **día del alta**, período = mes calendario actual (local, alineado con `toPeriod` / `formatLocalYMD`).
- Cobros siguientes: por `diaCobro` del alquiler; si el día no existe en el mes, último día del mes.
- Al generar cuota:
  - se inserta en `cliente_alquileres_cargos`;
  - **no** se modifica `clientes.saldo`;
  - se asegura producto **Cuota de alquiler** y se inserta `pedidos` (`pendient`) + `pedidositems`;
  - todo dentro de transacción.

### 7) CORS y método PATCH
Para cancelación por frontend, el backend debe permitir `PATCH` en CORS (`backend/server.js`).

### 8) Pruebas recomendadas
Script existente:
- `tests/alquileres-fechas-idempotencia.test.js`

Valida:
- Regla de fin de mes.
- No duplicación de cargos.

### 9) Flujo de despliegue sugerido
1. Aplicar migraciones SQL.
2. Reiniciar backend.
3. Verificar endpoints (`/api/alquileres` y `/api/clientes/:id/alquileres`).
4. Ejecutar cobro manual en ambiente de prueba.
5. Validar estado de cuenta, pedidos pendientes con **Cuota de alquiler** y que el saldo solo cambie al entregar esos pedidos.

### 10) Mejoras futuras sugeridas
- Generación de PDF de contrato.
- Firma digital/aceptación del cliente.
- Ledger completo de cuenta corriente (tabla de movimientos unificada).
- Plantillas personalizables de resumen/contrato por empresa.
- Scheduler anclado a horario fijo (p. ej. 00:00 en zona horaria de la empresa) vía cron o librería de cron en Node.
- Opcional: columna en `cliente_alquileres_cargos` con `codigoPedido` para trazabilidad directa.
