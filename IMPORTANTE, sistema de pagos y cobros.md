# Sistema de pagos y cobros en entregas

Documento de referencia para alinear **reglas de negocio**, **comportamiento del backend** y **evolución del producto** (caja, informes, tipos de pago).

---

## 1. Objetivo

Que cada entrega tenga un comportamiento **predecible** cuando:

- El cliente paga **menos** que el total del pedido (anticipo + resto a cuenta).
- El cliente paga **más** que el total (sobra = crédito a favor en el saldo del cliente).
- No hay efectivo ni transferencia en el acto (todo queda registrado como deuda o se usa saldo a favor).

Además, poder **documentar en caja** solo lo que realmente entró en efectivo (u otros medios que definamos), sin confundirlo con ventas “a cuenta corriente” puras.

---

## 2. Conceptos (sin mezclarlos)

| Concepto | Significado |
|----------|-------------|
| **Total del pedido** | Monto de la entrega (ítems), lo que “cuesta” el pedido. |
| **Monto cobrado en el acto** | Dinero (o equivalente) que el repartidor recibe **ahora**: efectivo, transferencia, etc. Puede ser 0, menor, igual o mayor al total. |
| **Saldo del cliente** | Posición contable del cliente respecto a la empresa (deuda y/o crédito según convención del sistema). El backend lo actualiza con fórmulas concretas en cada flujo. |
| **Caja del repartidor** | Efectivo (y medios acordados) que debe cuadrar al cerrar turno. Solo debe sumar lo que **entró físicamente o vía medio inmediato**, no la parte “quedó en cuenta”. |

**Regla mental:** el total del pedido siempre “se liquida” contra el cliente: parte en **monto cobrado en el acto** y parte en **cambio de saldo** (deuda nueva o consumo de crédito).

---

## 3. Comportamiento actual del backend (entrega)

Implementación principal: `POST /api/pedidos/:id/entregar` en `backend/routes/pedidos.js`. Atajo legacy: `PUT /api/pedidos/:id/estado` con `estado: "entregad"`, `tipoPago` y opcional `montoCobrado` (por defecto **0** si no se envía).

**Ya no hay rama por `aplicaSaldo` en la entrega:** el tipo de pago solo identifica el medio (etiqueta / `cobros.pagoTipo`) y debe ser un tipo **sin** “aplica saldo” en la UI de reparto.

### 3.1. “Saldo a favor” (`usarSaldoAFavor` y `montoCobrado === 0`)

- Se ajusta el saldo del cliente para absorber el pedido con crédito (`saldo = saldo + totalPedido` en la convención del código).
- **No** inserta en `cobros`.

### 3.2. Liquidación normal (resto de los casos)

- Inserta **una** fila en `cobros` con `total = montoCobrado` (puede ser **0**).
- Actualiza saldo del cliente: **`saldo = saldo + totalPedido - montoCobrado`**.
  - `M < T`: diferencia queda en cuenta.
  - `M > T`: excedente mejora saldo (vuelto / crédito).
  - `M = 0` sin flag saldo a favor: todo el pedido va al saldo; igual hay fila en `cobros` con total 0 (trazabilidad).

### 3.3. `PUT …/estado` (entregad)

- Misma fórmula de cliente: `saldo + total - montoCobrado`; `montoCobrado` opcional (default 0).
- Si `montoCobrado > 0`, inserta en `cobros`.
- Actualiza `pedidos.saldo` con `total - montoCobrado`, `tipoPago` y vendedor de entrega.

**Front (React):** en el modal de entrega solo se listan tipos con **`aplicaSaldo` desmarcado**; el texto guía a usar **monto 0** para “todo a cuenta”.

---

## 4. Casos de uso (comportamiento deseado y predecible)

Convención en los ejemplos: `totalPedido = T`, `montoCobrado = M` (medio inmediato en el acto).

| Caso | Condición | Efecto en saldo (idea) | Ingreso a caja / `cobros` |
|------|-----------|-------------------------|----------------------------|
| A. Contado total | `M = T` | Solo se cancela el impacto del pedido respecto al saldo según fórmula | `M` en caja; fila `cobros` con total `M` |
| B. Anticipo / parcial | `0 < M < T` | El cliente queda debiendo `T - M` (vía `+T - M` en saldo) | `M` en caja; informes pueden mostrar “parcial + saldo” |
| C. Paga de más | `M > T` | Excedente mejora saldo del cliente (crédito o cancelación de deuda) | `M` en caja |
| D. Sin dinero en el acto, todo a cuenta | `M = 0` (sin usar saldo a favor) | `+T` al saldo vía `+T - 0` | Caja +0; fila `cobros` con total 0 |
| E. Solo saldo a favor | flag `usarSaldoAFavor`, `M = 0` | Consume crédito del cliente según lógica actual | No `cobros` |

Los casos **A–D** cubren el flujo unificado por **monto**; los tipos con “aplica saldo” quedan fuera del selector de entrega (se pueden mantener en BD para otros usos o limpiar en configuración).

---

## 5. Simplificación aplicada

- **Entrega (React y `public/js`):** no se ofrecen tipos con `aplicaSaldo` en el selector; la cuenta corriente implícita es **monto cobrado = 0** (o parcial) con un medio inmediato (ej. Contado).
- **Backend `POST /entregar`:** eliminada la rama que trataba `aplicaSaldo = true` por separado.
- **`PUT /estado` + entregad:** misma lógica `saldo + T - M` y `cobros` si `M > 0`; conviene enviar `montoCobrado` (el front público ya lo hace).
- **Alta `startnow`:** solo se crea el tipo **Contado** (`aplicaSaldo = 0`); las empresas nuevas agregan transferencia u otros medios desde configuración si los necesitan.

**Pendiente / cuidados:**

1. Empresas que aún tengan solo “Cta cte” como tipo único: deben crear al menos un tipo **sin** aplica saldo o desmarcar el flag en tipos existentes.
2. **Caja:** el resumen debe seguir interpretando solo cobros con `total > 0` como efectivo si se desea excluir filas de trazabilidad con monto 0.
3. **`POST /api/pagos/cliente`** sigue rechazando tipos con aplica saldo (sin cambio).
4. **CRUD `tiposdepago`:** el campo `aplicaSaldo` puede seguir existiendo en API/admin para compatibilidad; la entrega lo ignora en la práctica al filtrar en UI.

---

## 6. Caja e informes (dirección recomendada)

- **Un registro por entrega** (o por línea de liquidación) facilita auditoría y totales por medio de pago.
- Separar explícitamente:
  - **Monto que ingresa a caja** (`M` o columna dedicada).
  - **Monto liquidado a cuenta** (`T - M` cuando corresponda).
- El **resumen de caja** debería sumar solo montos que **entran al efectivo** (o criterio escrito acá y en código), no el total del pedido ni ventas en cuenta corriente pura.

---

## 7. Resumen ejecutivo

1. **Pago mixto** = **`saldo + T - M`**; el medio elegido es solo etiqueta / trazabilidad en `cobros`.
2. **Sin tipo “cuenta corriente” en la entrega:** se usa **monto 0** (o parcial) con un medio inmediato.
3. Este documento es el contrato: cambios en `pedidos.js`, modales de entrega o caja deben alinearse con la sección 4.

---

## 8. Referencias en código

| Pieza | Ubicación |
|-------|-----------|
| Lógica de entrega y saldo | `backend/routes/pedidos.js` (`POST /:id/entregar`, `PUT /:id/estado`) |
| Resumen de caja (suma de cobros) | `backend/routes/caja.js` |
| Pago desde cliente (sin pedido en la misma transacción) | `backend/routes/pagos.js` (`POST /cliente`) |
| Modal de entrega (monto, tipo, saldo a favor) | `reactfront/src/features/pedidos/components/EntregarPedidoModal.tsx` |
| Entrega legacy (HTML) | `public/js/components/pedidos.js`, `public/js/services/api.js` |
| Tipos por defecto en alta Startnow | `backend/routes/startnow.js` |

---

*Última actualización: documento redactado para alinear análisis de producto con el código existente; los cambios de implementación deben reflejarse en este archivo.*
