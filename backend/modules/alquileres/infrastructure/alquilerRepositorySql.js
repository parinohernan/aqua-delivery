class AlquilerRepositorySql {
    constructor(queryFn) {
        this.query = queryFn;
    }

    async create({ codigoEmpresa, codigoCliente, tipo, marca, numeroSerie, observacion, montoMensual, fechaInicio, diaCobro }) {
        const result = await this.query(
            `INSERT INTO cliente_alquileres
            (codigoEmpresa, codigoCliente, tipo, marca, numeroSerie, observacion, montoMensual, fechaInicio, diaCobro, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
            [codigoEmpresa, codigoCliente, tipo, marca || null, numeroSerie || null, observacion || null, montoMensual, fechaInicio, diaCobro]
        );
        return result.insertId;
    }

    async getById(id, codigoEmpresa) {
        const rows = await this.query(
            `SELECT *
             FROM cliente_alquileres
             WHERE id = ? AND codigoEmpresa = ?`,
            [id, codigoEmpresa]
        );
        return rows[0] || null;
    }

    async listByCliente(codigoCliente, codigoEmpresa) {
        return this.query(
            `SELECT *
             FROM cliente_alquileres
             WHERE codigoCliente = ? AND codigoEmpresa = ?
             ORDER BY createdAt DESC`,
            [codigoCliente, codigoEmpresa]
        );
    }

    async cancel(id, codigoEmpresa, motivoCancelacion) {
        const result = await this.query(
            `UPDATE cliente_alquileres
             SET estado = 'CANCELADO',
                 fechaCancelacion = NOW(),
                 motivoCancelacion = ?
             WHERE id = ? AND codigoEmpresa = ? AND estado = 'ACTIVO'`,
            [motivoCancelacion || null, id, codigoEmpresa]
        );
        return result.affectedRows > 0;
    }

    async listActiveByEmpresa(codigoEmpresa) {
        return this.query(
            `SELECT *
             FROM cliente_alquileres
             WHERE codigoEmpresa = ? AND estado = 'ACTIVO'`,
            [codigoEmpresa]
        );
    }

    async listEmpresasWithActiveAlquileres() {
        const rows = await this.query(
            `SELECT DISTINCT codigoEmpresa
             FROM cliente_alquileres
             WHERE estado = 'ACTIVO'`
        );
        return rows.map((row) => row.codigoEmpresa);
    }
}

module.exports = { AlquilerRepositorySql };
