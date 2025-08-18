# 📋 Flujo Completo de Entrega de Pedidos

## 🎯 Resumen Ejecutivo

El sistema de entrega de pedidos es un proceso complejo que involucra múltiples validaciones, cálculos automáticos y actualizaciones en tiempo real. Este documento describe el flujo completo desde la selección del pedido hasta la confirmación de entrega.

---

## 🚀 Inicio del Proceso

### 1. Selección del Pedido
- **Ubicación**: Sección de Pedidos → Botón "Entregar"
- **Validación**: Solo pedidos con estado "pendient" pueden ser entregados
- **Trigger**: `entregarPedido(pedidoId)` → `deliveryModal.show(pedidoId)`

### 2. Carga de Datos del Pedido
```javascript
// Endpoint: GET /api/pedidos/:id
// Respuesta incluye:
{
  id: "934",
  codigoCliente: "123",
  total: 1500.00,
  estado: "pendient",
  fecha_pedido: "2024-01-15T10:30:00Z",
  // ... otros campos
}
```

### 3. Carga de Items del Pedido
```javascript
// Endpoint: GET /api/pedidos/:id/items
// Filtra solo productos activos (activo = 1)
// Respuesta incluye:
[
  {
    codigoProducto: "PROD001",
    cantidad: 2,
    nombreProducto: "Botella 2L",
    precioUnitario: 500.00,
    esRetornable: 1,
    subtotal: 1000.00
  }
]
```

---

## 💳 Gestión de Tipos de Pago

### 1. Obtención de Tipos de Pago
```javascript
// Endpoint: GET /api/tiposdepago
// Headers: Authorization: Bearer {token}
// Respuesta:
[
  {
    id: 1,
    pago: "Efectivo",
    aplicaSaldo: 0
  },
  {
    id: 7,
    pago: "Cta Cte",
    aplicaSaldo: 1
  }
]
```

### 2. Campo `aplicaSaldo`
- **Tipo**: MySQL BIT(1)
- **Valores**: 
  - `0` = No aplica saldo (pago inmediato)
  - `1` = Aplica saldo (cuenta corriente)
- **Conversión Frontend**: `convertirAplicaSaldo()` convierte el BIT a boolean
- **Comportamiento**: Determina si el monto se suma al saldo del cliente o se registra como cobro inmediato

### 3. Tipos de Pago Configurados
| ID | Nombre | aplicaSaldo | Comportamiento |
|----|--------|-------------|----------------|
| 1 | Efectivo | 0 | Pago inmediato |
| 2 | Transferencia | 0 | Pago inmediato |
| 3 | Tarjeta | 0 | Pago inmediato |
| 7 | Cta Cte | 1 | Suma al saldo |

### 4. Consecuencias de aplicaSaldo

#### **aplicaSaldo = 0 (Pago Inmediato)**
- **Campo montoCobrado**: Se debe ingresar el monto que paga el cliente
- **Tabla clientes**: El saldo NO se modifica
- **Tabla cobros**: Se crea un registro con el cobro realizado
- **Estado del cliente**: No cambia su deuda pendiente
- **Ejemplo**: Cliente paga $500 en efectivo → Cobro registrado, saldo sin cambios

#### **aplicaSaldo = 1 (Cuenta Corriente)**
- **Campo montoCobrado**: Se ignora (siempre 0)
- **Tabla clientes**: El saldo se incrementa con el total del pedido
- **Tabla cobros**: NO se crea registro
- **Estado del cliente**: Su deuda pendiente aumenta
- **Ejemplo**: Pedido de $300 a cuenta corriente → Saldo +$300, sin cobro registrado

---

## 🔄 Procesamiento de Retornables

### 1. Detección de Productos Retornables
```javascript
// Se calcula automáticamente al cargar items
this.totalRetornables = this.pedidoItems
  .filter(item => item.esRetornable === 1)
  .reduce((total, item) => total + item.cantidad, 0);
```

### 2. Interfaz de Retornables
- **Se muestra solo si**: `totalRetornables > 0`
- **Campo**: "¿Cuántos retornables devuelve el cliente?"
- **Validación**: `0 ≤ devueltos ≤ totalRetornables`
- **Cálculo**: `pendientes = totalRetornables - devueltos`

### 3. Lógica de Negocio
- **Retornables devueltos**: Se descuentan del total
- **Retornables no devueltos**: Se suman al saldo del cliente
- **Ejemplo**: 5 bidones en pedido, 3 devueltos → 2 se suman al saldo

---

## 💰 Procesamiento de Pagos

### 1. Caso: Aplica Saldo (Cuenta Corriente) - aplicaSaldo = 1
```javascript
if (aplicaSaldo) {
  // No se cobra monto, se suma al saldo
  montoCobrado = 0;
  
  // Backend: Actualizar saldo del cliente
  await query(
    'UPDATE clientes SET saldo = saldo + ? WHERE codigo = ?',
    [totalPedido, clienteId]
  );
}
```

**¿Qué sucede después?**
- ✅ **Saldo del cliente**: Se incrementa con el total del pedido
- ✅ **No se registra cobro**: No se crea registro en tabla `cobros`
- ✅ **Pedido entregado**: Estado cambia a "entregad"
- ✅ **Cliente debe**: El monto queda pendiente de pago
- ✅ **Ejemplo**: Cliente con saldo $500, pedido $300 → Nuevo saldo $800

### 2. Caso: No Aplica Saldo (Pago Inmediato) - aplicaSaldo = 0
```javascript
if (!aplicaSaldo) {
  // Validar monto cobrado
  if (montoCobrado < totalPedido) {
    // Mostrar diferencia faltante
  }
  
  // Backend: Registrar cobro
  const codigoCobro = generateUniqueCode();
  await query(
    'INSERT INTO cobros (codigo, codigoCliente, codigoVendedor, codigoEmpresa, total, pagoTipo, fechaCobro) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [codigoCobro, clienteId, vendedorId, empresaId, montoCobrado, tipoPago]
  );
}
```

**¿Qué sucede después?**
- ✅ **Cobro registrado**: Se crea registro en tabla `cobros`
- ✅ **Saldo del cliente**: No se modifica
- ✅ **Pedido entregado**: Estado cambia a "entregad"
- ✅ **Pago completado**: Cliente ya pagó el monto
- ✅ **Ejemplo**: Cliente paga $300 en efectivo → Cobro registrado, saldo sin cambios

### 3. Generación de Código de Cobro
```javascript
// Algoritmo: timestamp + clienteId
const timestamp = Date.now();
const timestampPart = parseInt(timestamp.toString().slice(-4));
const codigoCobro = (timestampPart * 100) + parseInt(clienteId);
// Ejemplo: 1234 * 100 + 456 = 123456
```

---

## 🔒 Transacciones de Base de Datos

### 1. Estructura de Transacción
```javascript
const result = await transaction(async (transactionQuery) => {
  // 1. Actualizar estado del pedido
  // 2. Procesar pago
  // 3. Procesar retornables
  // 4. Retornar resultado
});
```

### 2. Pasos de la Transacción

#### Paso 1: Actualizar Pedido
```sql
UPDATE pedidos 
SET estado = "entregad", fechaEntrega = NOW() 
WHERE codigo = ?
```

#### Paso 2: Procesar Pago
```sql
-- Si aplica saldo (aplicaSaldo = 1)
UPDATE clientes SET saldo = saldo + ? WHERE codigo = ?

-- Si no aplica saldo (aplicaSaldo = 0)
INSERT INTO cobros (codigo, codigoCliente, codigoVendedor, codigoEmpresa, total, pagoTipo, fechaCobro) 
VALUES (?, ?, ?, ?, ?, ?, NOW())
```

**Diferencias clave:**
- **aplicaSaldo = 1**: Solo actualiza saldo del cliente
- **aplicaSaldo = 0**: Solo registra cobro, no modifica saldo

#### Paso 3: Procesar Retornables
```sql
-- Si hay retornables no devueltos
UPDATE clientes SET retornables = retornables + ? WHERE codigo = ?
```

---

## 📊 Validaciones y Cálculos

### 1. Validaciones de Entrada
- ✅ Pedido existe y pertenece a la empresa
- ✅ Pedido está en estado "pendient"
- ✅ Tipo de pago existe y pertenece a la empresa
- ✅ Monto cobrado ≥ 0 (si no aplica saldo)
- ✅ Retornables devueltos ≤ total retornables

### 2. Cálculos Automáticos
```javascript
// Diferencia de pago (solo si no aplica saldo)
const diferencia = aplicaSaldo ? 0 : (totalPedido - montoCobrado);

// Retornables pendientes
const retornablesPendientes = totalRetornables - retornablesDevueltos;

// Saldo a aplicar
const saldoAAplicar = aplicaSaldo ? totalPedido : 0;

// Monto a cobrar
const montoACobrar = aplicaSaldo ? 0 : montoCobrado;
```

### 3. Mensajes de Resumen
- **Pago con aplicaSaldo = 1**: "💰 Pago: {tipo} - Se suma al saldo: ${total}"
- **Pago con aplicaSaldo = 0**: "💰 Pago: {tipo} - Cobrado: ${monto}"
- **Diferencia**: "📊 Diferencia: ${diferencia} (faltante/vuelto)" (solo si aplicaSaldo = 0)
- **Retornables**: "🔄 Retornables devueltos: {devueltos} de {total}"
- **Pendientes**: "⚠️ Retornables pendientes: {pendientes}"
- **Saldo actualizado**: "💳 Saldo del cliente actualizado: +${total}" (solo si aplicaSaldo = 1)

---

## 🔄 Actualización Reactiva

### 1. Eventos Emitidos
```javascript
// Al completar entrega exitosamente
window.eventBus.emit(window.EVENTS.PEDIDO_UPDATED, {
  pedidoId: pedidoId,
  nuevoEstado: 'entregad',
  tipoPago: tipoPagoId,
  aplicaSaldo: aplicaSaldo
});
```

### 2. Actualización de Lista
```javascript
// En index.astro
window.eventBus.on(window.EVENTS.PEDIDO_UPDATED, (data) => {
  console.log('📦 Pedido actualizado, actualizando lista...', data);
  loadPedidos(); // Recargar lista con filtros actuales
});
```

### 3. Mensajes de Éxito
```javascript
let mensaje = 'Pedido entregado correctamente.';

if (aplicaSaldo) {
  mensaje += ' Saldo actualizado en cuenta corriente.';
}

if (result.retornablesNoDevueltos > 0) {
  mensaje += ` ${result.retornablesNoDevueltos} retornables agregados al saldo del cliente.`;
}
```

---

## 📋 Estructura de Datos

### 1. Datos de Entrada (Frontend → Backend)
```javascript
{
  tipoPago: "7",                    // ID del tipo de pago
  montoCobrado: 1500,               // Monto cobrado (0 si aplicaSaldo = 1)
  retornablesDevueltos: 0,          // Cantidad de retornables devueltos
  totalRetornables: 1,              // Total de retornables en el pedido
  totalPedido: 1500                 // Total del pedido
}
```

### 2. Respuesta del Backend
```javascript
{
  success: true,
  message: "Pedido entregado correctamente",
  pedidoId: "934",
  tipoPago: "7",
  montoCobrado: 0,
  retornablesDevueltos: 0,
  retornablesNoDevueltos: 1,
  aplicaSaldo: true
}
```

### 3. Tablas Afectadas
- **`pedidos`**: Estado y fecha de entrega
- **`clientes`**: Saldo (si aplicaSaldo = 1) y retornables
- **`cobros`**: Registro de cobros (solo si aplicaSaldo = 0)

---

## 🚨 Manejo de Errores

### 1. Errores de Validación
- **Pedido no encontrado**: 404
- **Pedido no pendiente**: 400
- **Tipo de pago no encontrado**: 400
- **Datos inválidos**: 400

### 2. Errores de Transacción
- **Error de base de datos**: 500
- **Rollback automático**: Si cualquier paso falla
- **Logging detallado**: Para debugging

### 3. Errores de Frontend
- **Token expirado**: Redirigir a login
- **Error de red**: Mostrar mensaje de error
- **Validación de formulario**: Prevenir envío inválido

---

## 🔧 Configuración y Personalización

### 1. Tipos de Pago Personalizables
- **Crear**: POST `/api/tiposdepago`
- **Editar**: PUT `/api/tiposdepago/:id`
- **Eliminar**: DELETE `/api/tiposdepago/:id`
- **Listar**: GET `/api/tiposdepago`

### 2. Configuración de Empresa
- **Cada empresa**: Tiene sus propios tipos de pago
- **Seguridad**: Solo accede a datos de su empresa
- **Personalización**: Nombres y comportamientos específicos

### 3. Debug y Monitoreo
- **Endpoint debug**: GET `/api/tiposdepago/debug/:id`
- **Logging detallado**: En consola del servidor
- **Eventos**: Para monitoreo en tiempo real

---

## 📈 Métricas y Reportes

### 1. Datos Capturados
- **Fecha y hora de entrega**
- **Vendedor que realizó la entrega**
- **Tipo de pago utilizado**
- **Monto cobrado**
- **Retornables procesados**

### 2. Reportes Disponibles
- **Entregas por período**
- **Entregas por vendedor**
- **Tipos de pago más utilizados**
- **Retornables pendientes por cliente**

### 3. Auditoría
- **Trazabilidad completa**: Desde pedido hasta entrega
- **Historial de cambios**: En estado del pedido
- **Registro de cobros**: Para contabilidad

---

## 🎯 Casos de Uso Comunes

### 1. Entrega con Pago en Efectivo (aplicaSaldo = 0)
1. Seleccionar pedido pendiente
2. Elegir "Efectivo" como tipo de pago
3. Ingresar monto cobrado
4. Confirmar entrega
5. **Resultado**: 
   - ✅ Cobro registrado en tabla `cobros`
   - ✅ Saldo del cliente NO se modifica
   - ✅ Pedido marcado como "entregad"

### 2. Entrega a Cuenta Corriente (aplicaSaldo = 1)
1. Seleccionar pedido pendiente
2. Elegir "Cta Cte" como tipo de pago
3. Confirmar entrega (no se ingresa monto)
4. **Resultado**: 
   - ✅ Saldo del cliente se incrementa con el total del pedido
   - ✅ NO se registra cobro en tabla `cobros`
   - ✅ Pedido marcado como "entregad"
   - ✅ Cliente queda con deuda pendiente

### 3. Entrega con Retornables
1. Seleccionar pedido con productos retornables
2. Indicar cantidad de retornables devueltos
3. Confirmar entrega
4. **Resultado**: Retornables no devueltos se suman al saldo

### 4. Entrega Completa (Pago + Retornables)
1. Seleccionar pedido con retornables
2. Elegir tipo de pago (determina aplicaSaldo)
3. Ingresar monto (solo si aplicaSaldo = 0)
4. Indicar retornables devueltos
5. **Resultado**: 
   - ✅ Pago procesado según aplicaSaldo
   - ✅ Retornables no devueltos se suman al saldo del cliente
   - ✅ Pedido marcado como "entregad"

---

## 🔮 Mejoras Futuras

### 1. Funcionalidades Planificadas
- **Pagos parciales**: Permitir pagos en cuotas
- **Descuentos**: Aplicar descuentos en entrega
- **Fotos de entrega**: Capturar evidencia visual
- **Firma digital**: Confirmación del cliente

### 2. Optimizaciones Técnicas
- **Caché de tipos de pago**: Reducir consultas
- **Validación offline**: Funcionar sin conexión
- **Sincronización**: Sincronizar datos pendientes
- **Performance**: Optimizar consultas complejas

### 3. Integraciones
- **Sistema contable**: Exportar cobros
- **GPS**: Validar ubicación de entrega
- **WhatsApp**: Notificar al cliente
- **Impresión**: Generar comprobantes

---

*Documento actualizado: Enero 2024*
*Versión: 1.0*
*Autor: Sistema de Delivery Manager*
