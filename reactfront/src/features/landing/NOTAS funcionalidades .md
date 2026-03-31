# 🚀 Funcionalidades de Aqua Delivery Manager (ADM)

Este documento detalla el estado actual, el futuro inmediato y las ideas creativas para posicionar a ADM como la herramienta definitiva para el rubro.

---

## ✅ 1. Funcionalidades Actuales (MVP - Roadmap 1.0)
*Lo que ya está construido o en despliegue inminente para el lanzamiento.*

- **Gestión de Clientes:** Base de datos con ubicación, historial y frecuencias de entrega.
- **Hojas de Ruta Digitales:** Asignación de clientes por día y zona para los repartidores.
- **Control de Envases:** Seguimiento en tiempo real de bidones entregados, retirados y faltantes (el "capital" del sodero).
- **Cuentas Corrientes:** Gestión de saldos, cobros parciales y control de fiado.
- **App para Repartidores:** Interfaz móvil (Android/iOS) para carga de ventas en el acto desde la calle.
- **Dashboard Administrativo:** Vista para el dueño con resumen de ventas diarias y recaudación.
- **Soporte Multi-usuario:** Diferenciación entre administradores y choferes (con diferentes niveles de acceso).
- **Alquiler y Comodatos de Dispenser:** Registro de equipos, cobro de abonos mensuales automáticos y recordatorios de cobro.

---

## 🛠️ 2. Próximas Funcionalidades (Roadmap 2.0)
*Lo que viene a continuación para competir con los sistemas "Legacy" (WebSoft/Software JR).*

- **Módulo de Mantenimiento:**
    - Alertas automáticas para limpieza y sanitización de equipos (cada 6 meses).
    - Registro de reparaciones y repuestos (canillas, resistencias, etc.).
- **Facturación Electrónica:** Integración con ARCA para emitir facturas en el momento del reparto.
- **Optimización de Rutas (GPS):** Ordenar la hoja de ruta automáticamente para ahorrar km y combustible.
- **[ESTUDIANDO] Bot de Pedidos WhatsApp:** Tomar pedidos automáticamente vía WhatsApp y cargarlos en la hoja de ruta sin intervención humana.

### 🏛️ Reporte de Investigación: Facturación Legal (ARCA)
*Análisis para la implementación del módulo de facturación electrónica.*

**1. Reglamentación Vigente (ARCA - ex AFIP):**
- **Obligatoriedad:** Todos los contribuyentes (Monotributistas y Responsables Inscriptos) deben emitir comprobantes electrónicos (RG 4290).
- **Protocolos Clave:**
    - **WSAA (Servicio de Autenticación):** Requiere Certificado Digital (CRT y KEY) gestionado por el cliente en el portal de ARCA. Genera un Token de acceso válido por 12 horas.
    - **WSFE (Servicio de Factura Electrónica):** Permite solicitar el CAE (Código de Autorización Electrónico).
    - **QR Obligatorio:** Según RG 4892/2020, todos los comprobantes deben incluir un QR con los datos de la operación.
    - **RG 5614/2024 (Vigencia 2025):** Exige discriminar el IVA para consumidores finales si el monto supera cierto tope.

**2. Propuesta de Implementación Técnica:**
- **Modelo SaaS:** Centralizar la lógica en el Backend de ADM.
- **Flujo:** 
    1. El usuario sube su certificado `.crt` y llave `.key` (almacenados de forma encriptada).
    2. Al confirmar una venta "Legal" desde la App, ADM llama a la API de ARCA.
    3. Se obtiene el CAE en milisegundos y se genera el PDF con el logo del cliente + QR.
- **Herramientas sugeridas:** Uso de librerías como `afip.js` o integración vía API REST de terceros (Facturante/FacturaDirecta) para simplificar el mantenimiento de los esquemas XML de ARCA.

**3. Estrategia Comercial:**
- **Costo Extra:** Al ser un servicio que consume recursos de servidor críticos y requiere mantenimiento legal constante, se propone como un **Add-on** (Costo adicional al abono mensual) o una comisión mínima por comprobante emitido.

---

## 💡 3. Funcionalidades Sugeridas (Exploración Creativa)
*Ideas para wow-ear al cliente y diferenciarse totalmente de la competencia.*

- **IA Predictiva de Consumo:** El sistema analiza el historial y le avisa al chofer: *"Pasá por lo de Doña Rosa hoy, debería quedarse sin agua mañana"*.
- **Integración Nativa con Mercado Pago:** Cobro por QR desde la App del chofer que concilia el saldo automáticamente en ADM.
- **Portal del Cliente (Página de pedidos):** Un link simple para que el cliente pague su deuda por web o pida un refuerzo sin usar WhatsApp.
- **Gamificación para Choferes:** Ranking de "repartidor del mes" basado en envases recuperados o puntualidad, para motivar al personal.
- **Gestión de Gastos de Flota:** Registro de cargas de nafta, cambios de aceite y multas para calcular la rentabilidad real neta.
- **Notificaciones "Ya llego":** Enviar un WhatsApp automático al cliente cuando el repartidor esté a 5 cuadras para que prepare los envases/plata.
- **Módulo de Fábrica:** Control de producción (llenado de sifones, tratamiento de agua) para cerrar el círculo desde la planta al cliente.

---

> **Estrategia sugerida:** Priorizar el módulo de **mantenimiento de dispenser** ya que es el servicio de mayor margen para el sodero y lo que más los "ata" a usar un software profesional.
