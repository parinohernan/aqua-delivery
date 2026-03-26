const { query, transaction } = require('../../config/database');
const { AlquilerRepositorySql } = require('./infrastructure/alquilerRepositorySql');
const { ChargeRepositorySql } = require('./infrastructure/chargeRepositorySql');
const { ClienteSaldoGatewaySql } = require('./infrastructure/clienteSaldoGatewaySql');
const { CreateAlquiler } = require('./application/createAlquiler');
const { CancelAlquiler } = require('./application/cancelAlquiler');
const { GenerateMonthlyCharges } = require('./application/generateMonthlyCharges');

async function getDefaultVendedorIdForEmpresa(codigoEmpresa) {
    const rows = await query(
        'SELECT codigo FROM vendedores WHERE codigoEmpresa = ? ORDER BY codigo ASC LIMIT 1',
        [codigoEmpresa]
    );
    return rows[0]?.codigo ?? null;
}

function alquilerRepositoryFactory(customQuery) {
    return new AlquilerRepositorySql(customQuery || query);
}

function chargeRepositoryFactory(customQuery) {
    return new ChargeRepositorySql(customQuery || query);
}

function clienteSaldoGatewayFactory(customQuery) {
    return new ClienteSaldoGatewaySql(customQuery || query);
}

function createAlquilerUseCase() {
    return new CreateAlquiler({
        transaction,
        alquilerRepositoryFactory,
        chargeRepositoryFactory,
        clienteSaldoGatewayFactory,
    });
}

function cancelAlquilerUseCase() {
    return new CancelAlquiler({
        alquilerRepository: alquilerRepositoryFactory(),
    });
}

function generateMonthlyChargesUseCase() {
    return new GenerateMonthlyCharges({
        transaction,
        alquilerRepositoryFactory,
        chargeRepositoryFactory,
        getDefaultVendedorIdForEmpresa,
    });
}

module.exports = {
    alquilerRepositoryFactory,
    chargeRepositoryFactory,
    getDefaultVendedorIdForEmpresa,
    createAlquilerUseCase,
    cancelAlquilerUseCase,
    generateMonthlyChargesUseCase,
};
