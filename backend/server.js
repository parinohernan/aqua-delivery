require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:4321', 'http://localhost:4322', 'http://localhost:3000'], // Permitir frontend
  credentials: true
}));
app.use(express.json());

// Rutas API
app.use('/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/zonas', require('./routes/zonas'));
app.use('/api/tiposdepago', require('./routes/tiposdepago'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Backend funcionando correctamente' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Backend corriendo en http://localhost:${PORT}`);
});
