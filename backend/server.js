require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8001;

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Permitir cualquier origen localhost, IPs locales, netlify.app o koyeb.app
    if (!origin ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('http://172.') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.koyeb.app') ||
      origin === 'https://aquadeliverymanager.netlify.app') {
      callback(null, true);
    } else {
      console.log('CORS bloqueado para origen:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
app.use('/api/informes', require('./routes/informes'));
app.use('/api/push', require('./routes/push'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Backend funcionando correctamente' });
});

// Escuchar en todas las interfaces de red (0.0.0.0) para permitir acceso desde la red local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Backend corriendo en http://localhost:${PORT}`);
  console.log(`📱 Accesible desde la red en http://192.168.1.109:${PORT}`);
});
