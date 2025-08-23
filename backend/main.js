// main.js - Archivo principal para Parse Cloud Code
const express = require('express');
const cors = require('cors');

// Parse Server ya maneja la configuración de la base de datos
// Solo necesitamos definir nuestras Cloud Functions y rutas personalizadas

// Importar rutas
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const pagosRoutes = require('./routes/pagos');
const zonasRoutes = require('./routes/zonas');
const tiposdepagoRoutes = require('./routes/tiposdepago');
const informesRoutes = require('./routes/informes');

// Configurar Express para Cloud Code
Parse.Cloud.define("hello", (request) => {
    return "¡Hola desde Parse Cloud Code! API de AquaDelivery funcionando.";
});

// Health check como Cloud Function
Parse.Cloud.define("health", (request) => {
    return {
        status: "OK",
        message: "API Backend funcionando correctamente en Parse Cloud Code",
        timestamp: new Date().toISOString()
    };
});

// Configurar rutas Express personalizadas
Parse.Cloud.define("setupRoutes", (request) => {
    const app = express();
    
    // Middlewares
    app.use(cors({
        origin: [
            'http://localhost:4321', 
            'http://localhost:4322', 
            'http://localhost:3000',
            process.env.FRONTEND_URL || 'https://tu-app-frontend.netlify.app'
        ],
        credentials: true
    }));
    app.use(express.json());
    
    // Rutas API
    app.use('/auth', authRoutes);
    app.use('/api/clientes', clientesRoutes);
    app.use('/api/productos', productosRoutes);
    app.use('/api/pedidos', pedidosRoutes);
    app.use('/api/pagos', pagosRoutes);
    app.use('/api/zonas', zonasRoutes);
    app.use('/api/tiposdepago', tiposdepagoRoutes);
    app.use('/api/informes', informesRoutes);
    
    return "Rutas configuradas correctamente";
});

// Cloud Functions para cada endpoint principal
Parse.Cloud.define("getClientes", async (request) => {
    // Lógica para obtener clientes
    const query = new Parse.Query("Cliente");
    return await query.find();
});

Parse.Cloud.define("getProductos", async (request) => {
    // Lógica para obtener productos  
    const query = new Parse.Query("Producto");
    return await query.find();
});

Parse.Cloud.define("getPedidos", async (request) => {
    // Lógica para obtener pedidos
    const query = new Parse.Query("Pedido");
    return await query.find();
});

// Función de autenticación personalizada
Parse.Cloud.define("authenticate", async (request) => {
    const { telegramId, codigoEmpresa } = request.params;
    
    // Aquí puedes implementar tu lógica de autenticación
    if (telegramId === "freedom135" && codigoEmpresa === "1") {
        // Generar JWT o usar Parse User
        return {
            success: true,
            message: "Autenticación exitosa",
            user: {
                telegramId,
                codigoEmpresa
            }
        };
    }
    
    throw new Parse.Error(Parse.Error.INVALID_LOGIN, "Credenciales inválidas");
});
