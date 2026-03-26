const { CUOTA_ALQUILER_DESCRIPCION } = require('../domain/alquilerConstants');

async function ensureCuotaAlquilerProduct(txQuery, codigoEmpresa) {
    const rows = await txQuery(
        `SELECT codigo FROM productos
         WHERE codigoEmpresa = ? AND descripcion = ? AND activo = 1
         ORDER BY codigo ASC LIMIT 1`,
        [codigoEmpresa, CUOTA_ALQUILER_DESCRIPCION]
    );
    if (rows.length > 0) {
        return rows[0].codigo;
    }
    const result = await txQuery(
        `INSERT INTO productos (descripcion, precio, stock, esRetornable, codigoEmpresa, activo)
         VALUES (?, 0, 999999, 0, ?, 1)`,
        [CUOTA_ALQUILER_DESCRIPCION, codigoEmpresa]
    );
    return result.insertId;
}

async function getClienteZona(txQuery, codigoCliente, codigoEmpresa) {
    const rows = await txQuery(
        'SELECT zona FROM clientes WHERE codigo = ? AND codigoEmpresa = ? LIMIT 1',
        [codigoCliente, codigoEmpresa]
    );
    return rows[0]?.zona ?? null;
}

/**
 * Inserta cargo de alquiler en `cliente_alquileres_cargos` y crea pedido **pendient** con ítem "Cuota de alquiler".
 * No modifica `clientes.saldo`; la cobranza queda para el flujo normal de entrega del pedido.
 */
async function applyAlquilerChargeWithPedido(
    txQuery,
    { chargeRepositoryFactory },
    {
        codigoEmpresa,
        alquiler,
        periodo,
        fechaProgramada,
        detalle,
        vendedorId,
    }
) {
    const chargeRepository = chargeRepositoryFactory(txQuery);
    const monto = Number(alquiler.montoMensual);
    const marca = alquiler.marca ? ` (${alquiler.marca})` : '';
    const detalleFinal =
        detalle ?? `Cargo alquiler ${alquiler.tipo}${marca} - período ${periodo}`;

    await chargeRepository.createCharge({
        codigoEmpresa,
        alquilerId: alquiler.id,
        codigoCliente: alquiler.codigoCliente,
        periodo,
        fechaProgramada,
        monto,
        detalle: detalleFinal,
    });

    if (!vendedorId) {
        console.warn(
            `[alquileres] Sin vendedor para pedido de cuota (empresa ${codigoEmpresa}). Cargo registrado sin pedido.`
        );
        return;
    }

    const codigoProducto = await ensureCuotaAlquilerProduct(txQuery, codigoEmpresa);
    const zona = await getClienteZona(txQuery, alquiler.codigoCliente, codigoEmpresa);

    const pedidoIns = await txQuery(
        `INSERT INTO pedidos (codigoEmpresa, codigoCliente, codigoVendedorPedido, total, zona, FechaPedido, estado)
         VALUES (?, ?, ?, ?, ?, NOW(), 'pendient')`,
        [codigoEmpresa, alquiler.codigoCliente, vendedorId, monto, zona]
    );

    await txQuery(
        `INSERT INTO pedidositems (codigoPedido, codigoProducto, cantidad, precioTotal, descuento)
         VALUES (?, ?, 1, ?, 0)`,
        [pedidoIns.insertId, codigoProducto, monto]
    );
}

module.exports = {
    applyAlquilerChargeWithPedido,
    ensureCuotaAlquilerProduct,
};
