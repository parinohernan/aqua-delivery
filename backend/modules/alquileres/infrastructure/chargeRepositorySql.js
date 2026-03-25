class ChargeRepositorySql {
    constructor(queryFn) {
        this.query = queryFn;
    }

    async createCharge({
        codigoEmpresa,
        alquilerId,
        codigoCliente,
        periodo,
        fechaProgramada,
        monto,
        detalle,
    }) {
        return this.query(
            `INSERT INTO cliente_alquileres_cargos
            (codigoEmpresa, alquilerId, codigoCliente, periodo, fechaProgramada, fechaAplicada, monto, estado, detalle)
            VALUES (?, ?, ?, ?, ?, NOW(), ?, 'APLICADO', ?)`,
            [codigoEmpresa, alquilerId, codigoCliente, periodo, fechaProgramada, monto, detalle]
        );
    }

    async listByCliente(codigoCliente, codigoEmpresa, desde, hasta) {
        const filters = ['codigoEmpresa = ?', 'codigoCliente = ?'];
        const params = [codigoEmpresa, codigoCliente];

        if (desde) {
            filters.push('DATE(fechaAplicada) >= ?');
            params.push(desde);
        }
        if (hasta) {
            filters.push('DATE(fechaAplicada) <= ?');
            params.push(hasta);
        }

        return this.query(
            `SELECT id, periodo, fechaProgramada, fechaAplicada, monto, detalle, 'ALQUILER_CARGO' AS tipo
             FROM cliente_alquileres_cargos
             WHERE ${filters.join(' AND ')}
             ORDER BY fechaAplicada DESC`,
            params
        );
    }
}

module.exports = { ChargeRepositorySql };
