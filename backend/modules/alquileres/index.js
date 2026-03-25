const { query, transaction } = require('../../config/database');
const { AlquilerRepositorySql } = require('./infrastructure/alquilerRepositorySql');
const { ChargeRepositorySql } = require('./infrastructure/chargeRepositorySql');
const { ClienteSaldoGatewaySql } = require('./infrastructure/clienteSaldoGatewaySql');
const { CreateAlquiler } = require('./application/createAlquiler');
const { CancelAlquiler } = require('./application/cancelAlquiler');
const { GenerateMonthlyCharges } = require('./application/generateMonthlyCharges');

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
        alquilerRepository: alquilerRepositoryFactory(),
        clienteSaldoGateway: clienteSaldoGatewayFactory(),
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
        clienteSaldoGatewayFactory,
    });
}

module.exports = {
    alquilerRepositoryFactory,
    chargeRepositoryFactory,
    createAlquilerUseCase,
    cancelAlquilerUseCase,
    generateMonthlyChargesUseCase,
};
