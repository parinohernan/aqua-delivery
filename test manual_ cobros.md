# Pruebas manuales — cobros y entregas

Checklist para validar a mano el flujo de **entrega**, tabla **`cobros`**, **saldo del cliente** y **caja**. Convención usada abajo:

- **Saldo del cliente:** en la app, saldo **positivo** = el cliente **debe** dinero; **negativo** = **crédito / saldo a favor**.
- **Fórmula entrega (liquidación normal):** `saldo_nuevo = saldo_anterior + total_pedido − monto_cobrado`.
- **Caja (resumen):** suma `cobros.total` del vendedor en la sesión abierta (los registros con total **0** no suman al efectivo pero existen en BD).

**Preparación común**

1. Usuario con empresa que tenga al menos un tipo de pago **sin** “aplica saldo” (ej. Contado o Transferencia).
2. Cliente con saldo conocido (anotar **saldo inicial** antes de cada prueba).
3. Pedido **pendiente** con **total** conocido (ej. **T = $1.000**); si usás otro monto, recalculá los esperados con la fórmula.
4. Opcional: sesión de **caja abierta** para ver el resumen de cobros subir solo cuando `monto_cobrado > 0`.

---

## A. Entrega — liquidación normal (POST entregar / modal React)

Usar tipo **Contado** o **Transferencia** (medio inmediato), **sin** marcar “Usar saldo a favor”.

| # | Caso | Saldo inicial cliente | Total pedido T | Monto cobrado M | Saldo esperado después | Tabla `cobros` | Notas |
|---|------|------------------------|----------------|-----------------|-------------------------|----------------|--------|
| A1 | Pago total en efectivo | $0 | $1.000 | $1.000 | **$0** | **1 fila**, `total = 1000` | Pedido entregado; caja +$1.000 en la sesión |
| A2 | Todo a cuenta (sin efectivo) | $0 | $1.000 | **$0** | **$1.000** (debe) | **1 fila**, `total = 0` | Caja sin cambio por este cobro; trazabilidad en `cobros` |
| A3 | Parcial | $0 | $1.000 | **$400** | **$600** (debe) | **1 fila**, `total = 400` | Caja +$400 |
| A4 | Paga de más (sin deuda previa) | $0 | $1.000 | **$1.200** | **−$200** (crédito a favor) | **1 fila**, `total = 1200` | Caja +$1.200 |
| A5 | Con deuda previa, paga solo el pedido | **$500** (debe) | $1.000 | **$1.000** | **$500** (sigue debiendo lo anterior) | **1 fila**, `total = 1000` | 500 + 1000 − 1000 = 500 |
| A6 | Con deuda previa, paga pedido + parte deuda | **$500** | $1.000 | **$1.200** | **$300** | **1 fila**, `total = 1200` | 500 + 1000 − 1200 = 300 |
| A7 | Con deuda previa, liquida todo | **$500** | $1.000 | **$1.500** | **$0** | **1 fila**, `total = 1500` | 500 + 1000 − 1500 = 0 |
| A8 | Con crédito a favor (sin marcar checkbox) | **−$300** (a favor) | $1.000 | **$700** | **$0** | **1 fila**, `total = 700` | −300 + 1000 − 700 = 0 |

**Verificación extra A**

- En la ficha del cliente, el **saldo** coincide con la columna “Saldo esperado”.
- El pedido queda en estado **entregado**.
- Si tenés caja abierta: **total cobros** en resumen aumenta solo la suma de **M** de los casos con **M > 0** (A1, A3, A4, A5, A6, A7, A8 según montos).

---

## B. Entrega — saldo a favor (checkbox en modal)

Cliente con **saldo negativo** (crédito) suficiente para cubrir el pedido. Marcar **“Usar saldo a favor para este pedido”**.

| # | Caso | Saldo inicial | Total pedido T | Monto cobrado enviado al API | Saldo esperado después | Tabla `cobros` |
|---|------|---------------|----------------|------------------------------|-------------------------|----------------|
| B1 | Crédito cubre el pedido | **−$1.000** | $1.000 | **$0** (forzado por UI) | **$0** | **No** debe haber fila nueva en `cobros` |
| B2 | Crédito mayor que el pedido | **−$1.500** | $1.000 | **$0** | **−$500** | **Sin** fila en `cobros` |

**Verificación B**

- No aparece movimiento en **caja** por estos casos (no hay cobro en efectivo).
- Pedido **entregado**.

---

## C. Caja (sesión abierta)

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|----------------------|
| C1 | Cobro suma en sesión | Abrí caja; entregá un pedido con **M > 0**; refrescá resumen | **Total cobros** incluye **M** |
| C2 | M = 0 no suma efectivo | Entregá con **M = 0** (sin saldo a favor) | Resumen: **total cobros** igual que antes (la fila `cobros` con 0 no cambia la suma de dinero) |
| C3 | Saldo a favor | Entregá con checkbox saldo a favor | Resumen de caja **sin** incremento por esa entrega |
| C4 | Varios cobros | Varias entregas con M distintos en la misma sesión | Suma = suma de todos los **M** de esas entregas |

---

## D. Pago directo desde cliente (`POST /api/pagos/cliente` — modal cobro cliente)

No es entrega; va a tabla **`pagos`**, no siempre a **`cobros`**.

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|----------------------|
| D1 | Cobro válido | Cliente con deuda; tipo **sin** aplica saldo; monto > 0 | Saldo cliente **baja** (se resta deuda según lógica del endpoint); registro en **`pagos`** |
| D2 | Tipo cuenta corriente | Elegir tipo con **aplica saldo** | API debe **rechazar** (400) — en listados filtrados del modal de cobro no debería aparecer |

**Verificación D**

- El **resumen de caja** por **`cobros`** **no** incluye automáticamente estos pagos (hoy son flujos distintos). Si necesitás que sumen a caja, es decisión de producto futura.

---

## E. Tipos de pago en entrega (UI)

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|----------------------|
| E1 | Ocultar “aplica saldo” | Abrí modal **Entregar pedido** | No listar tipos marcados como **aplica saldo** |
| E2 | Solo tipos inmediatos | Empresa con solo “Cta cte” (aplica saldo) | Mensaje de error: no hay medios para entrega hasta crear tipo sin aplica saldo |

---

## F. Regresión / datos

| # | Caso | Pasos | Resultado esperado |
|---|------|--------|----------------------|
| F1 | Retornables | Pedido con retornables; completar cantidad devuelta | Entrega OK; saldo de retornables del cliente coherente (según lo ingresado) |
| F2 | Pedido no pendiente | Intentar entregar ya entregado | Error del backend |
| F3 | Anular pedido | Desde lista, anular | Estado **anulado**; no debe duplicar cobros |

---

## G. Plantilla rápida (copiar al probar)

```
Fecha: __________  Empresa: __________  Vendedor: __________

Caso: ___
Cliente ID: ___  Saldo antes: ___
Pedido ID: ___  Total T: ___
Monto M: ___  Saldo a favor [ ] sí [ ] no
Saldo después esperado: ___  Saldo después real: ___  OK [ ]

cobros: ¿nueva fila? [ ] sí [ ] no   total fila: ___
Caja resumen cobros antes: ___  después: ___  OK [ ]
```

---

## Referencia rápida de fórmulas

- **Liquidación normal:** `saldo_nuevo = saldo_anterior + T − M`.
- **Saldo a favor (checkbox):** `saldo_nuevo = saldo_anterior + T` (en el código actual absorbe el pedido contra crédito; **sin** `cobros`).
- **Caja:** `SUM(cobros.total)` en ventana de sesión (solo filas del vendedor y empresa); los **total = 0** no aportan efectivo a la suma.

Documento alineado con `IMPORTANTE, sistema de pagos y cobros.md`.
