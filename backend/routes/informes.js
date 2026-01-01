const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const { query } = require('../config/database');

// GET /api/informes/ventas - Generar informe de ventas
router.get('/ventas', verifyToken, async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, tipo = 'resumen' } = req.query;
    const { codigoEmpresa } = req.user;

    console.log('📊 Generando informe de ventas:', { fechaDesde, fechaHasta, tipo, codigoEmpresa });

    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({ 
        error: 'Se requieren las fechas desde y hasta' 
      });
    }

    if (tipo === 'resumen') {
      const informe = await generarInformeResumen(codigoEmpresa, fechaDesde, fechaHasta);
      res.json(informe);
    } else if (tipo === 'detallado') {
      const informe = await generarInformeDetallado(codigoEmpresa, fechaDesde, fechaHasta);
      res.json(informe);
    } else {
      res.status(400).json({ error: 'Tipo de informe no válido' });
    }

  } catch (error) {
    console.error('❌ Error generando informe:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Función para generar informe resumen
async function generarInformeResumen(codigoEmpresa, fechaDesde, fechaHasta) {
  console.log('📈 Generando informe resumen...');

  // Consulta principal para estadísticas generales
  const statsRows = await query(`
    SELECT 
      COUNT(DISTINCT p.codigo) as totalPedidos,
      COUNT(DISTINCT p.codigoCliente) as totalClientes,
      COALESCE(SUM(p.total), 0) as totalVentas
    FROM pedidos p
    WHERE p.codigoEmpresa = ?
      AND p.estado = 'entregad'
      AND DATE(p.FechaEntrega) BETWEEN ? AND ?
  `, [codigoEmpresa, fechaDesde, fechaHasta]);

  const stats = statsRows[0];

  // Consulta para productos más vendidos
  const productosRows = await query(`
    SELECT 
      pr.descripcion,
      SUM(pi.cantidad) as cantidad,
      SUM(pi.precioTotal) as total
    FROM pedidos p
    JOIN pedidositems pi ON p.codigo = pi.codigoPedido
    JOIN productos pr ON pi.codigoProducto = pr.codigo
    WHERE p.codigoEmpresa = ?
      AND p.estado = 'entregad'
      AND DATE(p.FechaEntrega) BETWEEN ? AND ?
    GROUP BY pr.codigo, pr.descripcion
    ORDER BY cantidad DESC
    LIMIT 10
  `, [codigoEmpresa, fechaDesde, fechaHasta]);

  return {
    totalPedidos: stats.totalPedidos,
    totalClientes: stats.totalClientes,
    totalVentas: parseFloat(stats.totalVentas) || 0,
    productos: productosRows.map(p => ({
      descripcion: p.descripcion,
      cantidad: parseInt(p.cantidad),
      total: parseFloat(p.total) || 0
    }))
  };
}

// Función para generar informe detallado por cliente
// OPTIMIZADA: Usa solo 3 queries en total en lugar de N*2 queries
async function generarInformeDetallado(codigoEmpresa, fechaDesde, fechaHasta) {
  console.log('📋 Generando informe detallado por cliente (optimizado)...');

  // Query 1: Obtener todos los clientes con sus estadísticas generales
  const clientesRows = await query(`
    SELECT 
      c.codigo,
      c.nombre,
      c.apellido,
      c.telefono,
      COUNT(DISTINCT p.codigo) as totalPedidos,
      COALESCE(SUM(p.total), 0) as totalComprado
    FROM clientes c
    JOIN pedidos p ON c.codigo = p.codigoCliente
    WHERE p.codigoEmpresa = ?
      AND p.estado = 'entregad'
      AND DATE(p.FechaEntrega) BETWEEN ? AND ?
    GROUP BY c.codigo, c.nombre, c.apellido, c.telefono
    ORDER BY totalComprado DESC
  `, [codigoEmpresa, fechaDesde, fechaHasta]);

  console.log(`📊 Encontrados ${clientesRows.length} clientes, obteniendo detalles...`);

  // Query 2: Obtener TODOS los productos de TODOS los clientes en una sola query
  const productosRows = await query(`
    SELECT 
      p.codigoCliente,
      pr.codigo as codigoProducto,
      pr.descripcion,
      SUM(pi.cantidad) as cantidadTotal,
      SUM(pi.precioTotal) as totalPagado,
      AVG(pi.precioTotal / pi.cantidad) as precioPromedio,
      COUNT(DISTINCT p.codigo) as pedidosConEsteProducto
    FROM pedidos p
    JOIN pedidositems pi ON p.codigo = pi.codigoPedido
    JOIN productos pr ON pi.codigoProducto = pr.codigo
    WHERE p.codigoEmpresa = ?
      AND p.estado = 'entregad'
      AND DATE(p.FechaEntrega) BETWEEN ? AND ?
    GROUP BY p.codigoCliente, pr.codigo, pr.descripcion
    ORDER BY p.codigoCliente, cantidadTotal DESC
  `, [codigoEmpresa, fechaDesde, fechaHasta]);

  // Query 3: Obtener TODOS los pedidos de TODOS los clientes en una sola query
  const pedidosRows = await query(`
    SELECT 
      p.codigoCliente,
      p.codigo as codigoPedido,
      p.fechaPedido,
      p.FechaEntrega,
      p.total as totalPedido,
      COUNT(pi.codigo) as cantidadItems
    FROM pedidos p
    LEFT JOIN pedidositems pi ON p.codigo = pi.codigoPedido
    WHERE p.codigoEmpresa = ?
      AND p.estado = 'entregad'
      AND DATE(p.FechaEntrega) BETWEEN ? AND ?
    GROUP BY p.codigo, p.codigoCliente, p.fechaPedido, p.FechaEntrega, p.total
    ORDER BY p.codigoCliente, p.FechaEntrega DESC
  `, [codigoEmpresa, fechaDesde, fechaHasta]);

  console.log(`✅ Datos obtenidos: ${productosRows.length} productos, ${pedidosRows.length} pedidos`);

  // Agrupar productos y pedidos por cliente en memoria (muy rápido)
  const productosPorCliente = {};
  productosRows.forEach(row => {
    if (!productosPorCliente[row.codigoCliente]) {
      productosPorCliente[row.codigoCliente] = [];
    }
    productosPorCliente[row.codigoCliente].push({
      codigo: row.codigoProducto,
      descripcion: row.descripcion,
      cantidadTotal: parseInt(row.cantidadTotal),
      totalPagado: parseFloat(row.totalPagado) || 0,
      precioPromedio: parseFloat(row.precioPromedio) || 0,
      pedidosConEsteProducto: parseInt(row.pedidosConEsteProducto)
    });
  });

  const pedidosPorCliente = {};
  pedidosRows.forEach(row => {
    if (!pedidosPorCliente[row.codigoCliente]) {
      pedidosPorCliente[row.codigoCliente] = [];
    }
    pedidosPorCliente[row.codigoCliente].push({
      codigo: row.codigoPedido,
      fechaPedido: row.fechaPedido,
      fechaEntrega: row.FechaEntrega,
      total: parseFloat(row.totalPedido) || 0,
      cantidadItems: parseInt(row.cantidadItems)
    });
  });

  // Construir el resultado final
  const clientesConProductos = clientesRows.map(cliente => ({
    codigo: cliente.codigo,
    nombre: cliente.nombre,
    apellido: cliente.apellido || '',
    telefono: cliente.telefono || '',
    totalPedidos: parseInt(cliente.totalPedidos),
    totalComprado: parseFloat(cliente.totalComprado) || 0,
    productos: productosPorCliente[cliente.codigo] || [],
    pedidos: pedidosPorCliente[cliente.codigo] || []
  }));

  console.log(`✅ Informe detallado generado: ${clientesConProductos.length} clientes procesados`);

  return {
    clientes: clientesConProductos
  };
}

module.exports = router;
