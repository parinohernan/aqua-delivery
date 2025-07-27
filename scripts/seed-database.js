require('dotenv').config();
const { query } = require('../config/database');

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed de la base de datos...');

        // 1. Crear empresa de prueba
        console.log('📊 Creando empresa...');
        const empresaResult = await query(`
            INSERT INTO empresa (codigo, razonSocial, fechaAlta, plan, usaEntregaProgramada, usaRepartoPorZona) 
            VALUES (1, 'AquaDelivery Demo', CURDATE(), 'premium', 1, 1)
            ON DUPLICATE KEY UPDATE razonSocial = VALUES(razonSocial)
        `);
        console.log('✅ Empresa creada');

        // 2. Crear vendedor de prueba
        console.log('👤 Creando vendedor...');
        await query(`
            INSERT INTO vendedores (codigo, codigoEmpresa, telegramId, nombre, apellido, zona) 
            VALUES (1, 1, '123456789', 'Juan', 'Vendedor', 'Centro')
            ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
        `);
        console.log('✅ Vendedor creado');

        // 3. Crear productos de prueba
        console.log('🏷️ Creando productos...');
        const productos = [
            { codigo: 1, descripcion: 'Bidón 20L', precio: 1500.00, stock: 50 },
            { codigo: 2, descripcion: 'Bidón 12L', precio: 1000.00, stock: 30 },
            { codigo: 3, descripcion: 'Botella 2L', precio: 300.00, stock: 100 },
            { codigo: 4, descripcion: 'Botella 500ml', precio: 150.00, stock: 200 }
        ];

        for (const producto of productos) {
            await query(`
                INSERT INTO productos (codigo, codigoEmpresa, descripcion, precio, stock, activo, esRetornable) 
                VALUES (?, 1, ?, ?, ?, 1, 0)
                ON DUPLICATE KEY UPDATE 
                    descripcion = VALUES(descripcion),
                    precio = VALUES(precio),
                    stock = VALUES(stock)
            `, [producto.codigo, producto.descripcion, producto.precio, producto.stock]);
        }
        console.log('✅ Productos creados');

        // 4. Crear clientes de prueba
        console.log('👥 Creando clientes...');
        const clientes = [
            { codigo: 1, nombre: 'Juan', apellido: 'Pérez', direccion: 'Av. Corrientes 1234', telefono: '1123456789', descripcion: 'Cliente frecuente' },
            { codigo: 2, nombre: 'María', apellido: 'González', direccion: 'San Martín 567', telefono: '1187654321', descripcion: 'Oficina centro' },
            { codigo: 3, nombre: 'Carlos', apellido: 'López', direccion: 'Belgrano 890', telefono: '1155556666', descripcion: 'Casa particular' },
            { codigo: 4, nombre: 'Ana', apellido: 'Martínez', direccion: 'Rivadavia 456', telefono: '1177778888', descripcion: 'Departamento' },
            { codigo: 5, nombre: 'Luis', apellido: 'Rodríguez', direccion: 'Mitre 789', telefono: '1199990000', descripcion: 'Local comercial' }
        ];

        for (const cliente of clientes) {
            await query(`
                INSERT INTO clientes (codigo, nombre, apellido, direccion, telefono, descripcion, codigoEmpresa, activo) 
                VALUES (?, ?, ?, ?, ?, ?, '1', 1)
                ON DUPLICATE KEY UPDATE 
                    nombre = VALUES(nombre),
                    apellido = VALUES(apellido),
                    direccion = VALUES(direccion),
                    telefono = VALUES(telefono),
                    descripcion = VALUES(descripcion)
            `, [cliente.codigo, cliente.nombre, cliente.apellido, cliente.direccion, cliente.telefono, cliente.descripcion]);
        }
        console.log('✅ Clientes creados');

        // 5. Crear pedidos de prueba
        console.log('📦 Creando pedidos...');
        const pedidos = [
            { codigo: 1, codigoCliente: 1, total: 2500.00, tipoPago: 'efectivo', estado: 'pendient', fecha: new Date() },
            { codigo: 2, codigoCliente: 2, total: 1800.00, tipoPago: 'efectivo', estado: 'proceso', fecha: new Date(Date.now() - 86400000) },
            { codigo: 3, codigoCliente: 3, total: 3200.00, tipoPago: 'efectivo', estado: 'entregad', fecha: new Date(Date.now() - 172800000) }
        ];

        for (const pedido of pedidos) {
            await query(`
                INSERT INTO pedidos (codigo, codigoEmpresa, codigoCliente, codigoVendedorPedido, total, tipoPago, FechaPedido, estado) 
                VALUES (?, 1, ?, 1, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    total = VALUES(total),
                    tipoPago = VALUES(tipoPago),
                    estado = VALUES(estado)
            `, [pedido.codigo, pedido.codigoCliente, pedido.total, pedido.tipoPago, pedido.fecha, pedido.estado]);
        }
        console.log('✅ Pedidos creados');

        // 6. Crear items de pedidos
        console.log('📋 Creando items de pedidos...');
        const items = [
            { codigoPedido: 1, codigoProducto: 1, cantidad: 1, precioTotal: 1500.00 },
            { codigoPedido: 1, codigoProducto: 3, cantidad: 3, precioTotal: 900.00 },
            { codigoPedido: 2, codigoProducto: 2, cantidad: 1, precioTotal: 1000.00 },
            { codigoPedido: 2, codigoProducto: 4, cantidad: 5, precioTotal: 750.00 },
            { codigoPedido: 3, codigoProducto: 1, cantidad: 2, precioTotal: 3000.00 }
        ];

        for (const item of items) {
            await query(`
                INSERT INTO pedidositems (codigoPedido, codigoProducto, cantidad, precioTotal) 
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    cantidad = VALUES(cantidad),
                    precioTotal = VALUES(precioTotal)
            `, [item.codigoPedido, item.codigoProducto, item.cantidad, item.precioTotal]);
        }
        console.log('✅ Items de pedidos creados');

        // 7. Crear zonas de prueba
        console.log('🗺️ Creando zonas...');
        const zonas = [
            { zona: 'Centro', codigoEmpresa: '1' },
            { zona: 'Norte', codigoEmpresa: '1' },
            { zona: 'Sur', codigoEmpresa: '1' },
            { zona: 'Este', codigoEmpresa: '1' },
            { zona: 'Oeste', codigoEmpresa: '1' }
        ];

        for (const zona of zonas) {
            await query(`
                INSERT INTO zonas (zona, codigoEmpresa) 
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE zona = VALUES(zona)
            `, [zona.zona, zona.codigoEmpresa]);
        }
        console.log('✅ Zonas creadas');

        console.log('🎉 ¡Seed completado exitosamente!');
        console.log('📊 Datos creados:');
        console.log('   - 1 Empresa');
        console.log('   - 1 Vendedor');
        console.log('   - 4 Productos');
        console.log('   - 5 Clientes');
        console.log('   - 3 Pedidos');
        console.log('   - 5 Items de pedidos');
        console.log('   - 5 Zonas');

    } catch (error) {
        console.error('❌ Error en seed:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('✅ Seed completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };
