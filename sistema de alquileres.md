# Sistema de Alquileres

Este documento incluye:
- Guía de usuario (uso operativo).
- Guía de programador (arquitectura y mantenimiento técnico).

---

## Guía de Usuario

### 1) ¿Para qué sirve?
El módulo de alquileres permite registrar equipos alquilados a clientes (por ejemplo, dispenser frío/calor), cobrar un monto mensual automáticamente y sumar ese cargo a la deuda del cliente con detalle.

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

Regla de cobro:
- Se cobra todos los meses en el día de la fecha de inicio.
- Si ese mes no tiene ese día, se cobra el último día del mes.

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
El cargo mensual:
- Aumenta `saldo` del cliente.
- Se registra con detalle en el estado de cuenta como cargo de alquiler.

---

## Guía del Programador

### 1) Resumen de diseño
Se implementó enfoque híbrido:
- Compatible con deuda actual basada en `clientes.saldo`.
- Estructurado por capas para evolución futura.

Capas:
- **Dominio**: reglas de calendario e idempotencia.
- **Aplicación**: casos de uso (crear, cancelar, generar cargos).
- **Infraestructura**: repositorios SQL y gateway de saldo.
- **API**: rutas Express.

### 2) Estructura de archivos
- `backend/modules/alquileres/domain/alquilerRules.js`
- `backend/modules/alquileres/application/createAlquiler.js`
- `backend/modules/alquileres/application/cancelAlquiler.js`
- `backend/modules/alquileres/application/generateMonthlyCharges.js`
- `backend/modules/alquileres/infrastructure/alquilerRepositorySql.js`
- `backend/modules/alquileres/infrastructure/chargeRepositorySql.js`
- `backend/modules/alquileres/infrastructure/clienteSaldoGatewaySql.js`
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

### 4) Endpoints
- `POST /api/alquileres`  
  Crea alquiler.
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
- Corre diariamente.
- Busca empresas con alquileres activos.
- Ejecuta generación de cargos por período.
- Si un período ya fue cobrado, no duplica (clave única + manejo `ER_DUP_ENTRY`).

### 6) Reglas clave de negocio
- El cobro mensual se programa por `diaCobro` del alquiler.
- Si el día no existe en el mes, se usa último día del mes.
- Al crear cargo:
  - se inserta en `cliente_alquileres_cargos`.
  - se incrementa `clientes.saldo`.
  - todo dentro de transacción.

### 7) CORS y método PATCH
Para cancelación por frontend, el backend debe permitir `PATCH` en CORS (`backend/server.js`).

### 8) Pruebas recomendadas
Script existente:
- `tests/alquileres-fechas-idempotencia.test.js`

Valida:
- Regla de fin de mes.
- No duplicación de cargos.
- Incremento único de saldo.

### 9) Flujo de despliegue sugerido
1. Aplicar migraciones SQL.
2. Reiniciar backend.
3. Verificar endpoints (`/api/alquileres` y `/api/clientes/:id/alquileres`).
4. Ejecutar cobro manual en ambiente de prueba.
5. Validar estado de cuenta y saldo.

### 10) Mejoras futuras sugeridas
- Generación de PDF de contrato.
- Firma digital/aceptación del cliente.
- Ledger completo de cuenta corriente (tabla de movimientos unificada).
- Plantillas personalizables de resumen/contrato por empresa.
