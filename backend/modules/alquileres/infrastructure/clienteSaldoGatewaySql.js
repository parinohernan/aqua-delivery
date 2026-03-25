class ClienteSaldoGatewaySql {
    constructor(queryFn) {
        this.query = queryFn;
    }

    async exists(codigoCliente, codigoEmpresa) {
        const rows = await this.query(
            'SELECT codigo FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1 LIMIT 1',
            [codigoCliente, codigoEmpresa]
        );
        return rows.length > 0;
    }

    async incrementSaldo(codigoCliente, codigoEmpresa, monto) {
        const result = await this.query(
            'UPDATE clientes SET saldo = COALESCE(saldo, 0) + ? WHERE codigo = ? AND codigoEmpresa = ?',
            [monto, codigoCliente, codigoEmpresa]
        );
        return result.affectedRows > 0;
    }
}

module.exports = { ClienteSaldoGatewaySql };
