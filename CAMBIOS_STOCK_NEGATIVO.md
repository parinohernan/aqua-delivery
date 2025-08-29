# 📦 Cambios para Permitir Stock Negativo

## 🎯 Objetivo
Permitir que se carguen pedidos incluso cuando no hay stock suficiente, manteniendo el descuento de stock (que puede quedar negativo).

## 🔧 Cambios Realizados

### 1. Backend - `backend/routes/pedidos.js`
**Líneas 147-160:**
- ❌ **Antes**: Validación que impedía crear pedidos con stock insuficiente
- ✅ **Después**: Solo verifica que el producto existe, muestra advertencia pero permite continuar

```javascript
// Antes:
if (producto[0].stock < item.cantidad) {
    return res.status(400).json({
        error: `Stock insuficiente para ${producto[0].descripcion}. Disponible: ${producto[0].stock}, Solicitado: ${item.cantidad}`
    });
}

// Después:
if (producto[0].stock < item.cantidad) {
    console.log(`⚠️ Stock insuficiente para ${producto[0].descripcion}. Disponible: ${producto[0].stock}, Solicitado: ${item.cantidad}. Continuando con stock negativo.`);
}
```

### 2. Frontend - `frontend/public/js/OrderModal.js`
**Líneas 543-546, 552-555, 593-596:**
- ❌ **Antes**: Alertas que impedían agregar productos con stock insuficiente
- ✅ **Después**: Solo muestra advertencias en consola, permite continuar

```javascript
// Antes:
if (quantity > availableStock) {
    alert(`Stock insuficiente. Disponible: ${availableStock}`);
    return;
}

// Después:
if (quantity > availableStock) {
    console.log(`⚠️ Stock insuficiente. Disponible: ${availableStock}, Solicitado: ${quantity}. Continuando con stock negativo.`);
}
```

### 3. Modelo Producto - `public/js/models/Producto.js`
**Líneas 34-37:**
- ❌ **Antes**: Validación que no permitía stock negativo
- ✅ **Después**: Validación comentada para permitir stock negativo

```javascript
// Antes:
if (this.stock < 0) {
    errors.push('El stock no puede ser negativo');
}

// Después:
// Permitir stock negativo para casos donde el stock no está actualizado
// if (this.stock < 0) {
//     errors.push('El stock no puede ser negativo');
// }
```

**Líneas 82-92:**
- ❌ **Antes**: Método `updateStock` limitaba el stock a 0
- ✅ **Después**: Permite stock negativo

```javascript
// Antes:
this.stock = Math.max(0, this.stock - cantidad);

// Después:
this.stock = this.stock - cantidad; // Permite stock negativo
```

## ✅ Funcionalidades Mantenidas

1. **Descuento de Stock**: Se sigue descontando el stock de los productos al crear pedidos
2. **Logs de Advertencia**: Se muestran advertencias en consola cuando el stock es insuficiente
3. **Validación de Productos**: Se sigue verificando que los productos existan y estén activos
4. **Base de Datos**: MySQL permite valores negativos en el campo `stock` (int(11) NOT NULL)

## 🎯 Resultado

Ahora el sistema permite:
- ✅ Crear pedidos con productos que tienen stock insuficiente
- ✅ El stock puede quedar negativo después de los pedidos
- ✅ Se mantienen logs de advertencia para monitoreo
- ✅ El descuento de stock funciona normalmente

## 📝 Notas Importantes

- Los valores negativos de stock indican que el stock físico no está actualizado en el sistema
- Es recomendable revisar y actualizar el stock físico regularmente
- Las advertencias en consola ayudan a identificar productos con stock desactualizado
