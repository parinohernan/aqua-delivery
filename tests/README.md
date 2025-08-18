# Tests para Delivery Manager

Este directorio contiene tests para verificar el funcionamiento correcto del sistema de entrega de pedidos.

## 📋 Archivos de Test

### 1. `test-aplica-saldo.js`
Test simple para verificar el problema de conversión de `aplicaSaldo` en tipos de pago.

**Uso:**
```bash
npm run test
```

### 2. `test-entrega-simple.js`
Test para probar una entrega completa con Cta Cte.

**Uso:**
```bash
npm run test-entrega
```

### 3. `entrega-pedidos.test.js`
Test completo que simula todos los casos posibles de entrega:
- Pedido con retornables, pago efectivo, todos devueltos
- Pedido con retornables, pago efectivo, algunos devueltos
- Pedido con retornables, cuenta corriente, todos devueltos
- Pedido sin retornables, cuenta corriente
- Pedido mixto, cuenta corriente, algunos retornables devueltos

**Uso:**
```bash
npm run test-completo
```

## 🚀 Configuración

### 1. Instalar dependencias
```bash
cd tests
npm install
```

### 2. Obtener token de autenticación
1. Abre el navegador y ve a la aplicación
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña Network
4. Haz login y busca una request a `/api/`
5. Copia el token del header `Authorization`
6. Reemplaza `TEST_TOKEN` en los archivos de test

### 3. Verificar que el backend esté corriendo
```bash
# El backend debe estar corriendo en http://localhost:3000
```

## 🧪 Casos de Test

### Caso 1: Pago Efectivo + Retornables Devueltos
- **Comportamiento esperado**: No se actualiza saldo, no se agregan retornables
- **Resultado**: Cliente mantiene saldo y retornables originales

### Caso 2: Pago Efectivo + Retornables Parcialmente Devueltos
- **Comportamiento esperado**: No se actualiza saldo, se agregan retornables no devueltos
- **Resultado**: Cliente mantiene saldo, aumenta retornables

### Caso 3: Cuenta Corriente + Retornables Devueltos
- **Comportamiento esperado**: Se suma al saldo, no se agregan retornables
- **Resultado**: Cliente aumenta saldo, mantiene retornables

### Caso 4: Cuenta Corriente + Sin Retornables
- **Comportamiento esperado**: Se suma al saldo, no hay retornables
- **Resultado**: Cliente aumenta saldo, mantiene retornables

### Caso 5: Cuenta Corriente + Retornables Parcialmente Devueltos
- **Comportamiento esperado**: Se suma al saldo, se agregan retornables no devueltos
- **Resultado**: Cliente aumenta saldo y retornables

## 🔧 Limpieza

Para limpiar los datos de prueba:
```bash
npm run cleanup
```

## 📊 Interpretación de Resultados

### ✅ Éxito
- Los cambios en saldo y retornables coinciden con lo esperado
- No hay errores en la consola
- Las transacciones se completan correctamente

### ❌ Problemas Comunes

1. **Token inválido**: Error 401
   - **Solución**: Obtener un token válido del navegador

2. **Backend no disponible**: Error de conexión
   - **Solución**: Verificar que el backend esté corriendo

3. **aplicaSaldo incorrecto**: Cta Cte procesa como pago inmediato
   - **Solución**: Verificar la conversión de Buffer en el backend

4. **Transacción fallida**: Error en la base de datos
   - **Solución**: Verificar logs del backend para detalles

## 🐛 Debugging

### Logs del Backend
Los tests generan logs detallados en el backend. Busca estos patrones:

```
🔄 CONVIRTIENDO aplicaSaldo:
   📝 Valor recibido: <Buffer 01>
   📝 Tipo: object
   🔄 Es Buffer, data[0]: 1, resultado: true
```

### Logs del Frontend
En el navegador, busca estos logs:

```
💳 aplicaSaldo raw: <Buffer 01>
💳 aplicaSaldo convertido: true
```

## 📝 Notas

- Los tests usan el cliente ID 7 (Aby Guadalupe) por defecto
- Los tests crean pedidos reales en la base de datos
- Usa `npm run cleanup` para limpiar después de las pruebas
- Los tests asumen que el backend está corriendo en `localhost:3000`
