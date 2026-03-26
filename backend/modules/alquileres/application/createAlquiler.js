const { toPeriod, formatLocalYMD } = require('../domain/alquilerRules');
const { applyAlquilerChargeWithPedido } = require('../infrastructure/alquilerChargeWithPedidoSql');

class CreateAlquiler {
    constructor({
        transaction,
        alquilerRepositoryFactory,
        chargeRepositoryFactory,
        clienteSaldoGatewayFactory,
    }) {
        this.transaction = transaction;
        this.alquilerRepositoryFactory = alquilerRepositoryFactory;
        this.chargeRepositoryFactory = chargeRepositoryFactory;
        this.clienteSaldoGatewayFactory = clienteSaldoGatewayFactory;
    }

    async execute({
        codigoEmpresa,
        codigoCliente,
        tipo,
        marca,
        numeroSerie,
        observacion,
        montoMensual,
        fechaInicio,
        vendedorId,
    }) {
        if (!codigoEmpresa || !codigoCliente) {
            throw new Error('codigoEmpresa y codigoCliente son requeridos');
        }
        if (!vendedorId) {
            throw new Error('vendedor requerido para registrar alquiler y primera cuota');
        }
        const tipoNormalizado = String(tipo || '').trim();
        if (!tipoNormalizado) {
            throw new Error('tipo de alquiler es requerido');
        }
        const monto = Number(montoMensual);
        if (!Number.isFinite(monto) || monto <= 0) {
            throw new Error('montoMensual debe ser mayor a 0');
        }

        const inicio = new Date(fechaInicio);
        if (Number.isNaN(inicio.getTime())) {
            throw new Error('fechaInicio inválida');
        }

        const clienteSaldoGateway = this.clienteSaldoGatewayFactory();
        const clienteExiste = await clienteSaldoGateway.exists(codigoCliente, codigoEmpresa);
        if (!clienteExiste) {
            throw new Error('Cliente no encontrado');
        }

        const diaCobro = inicio.getUTCDate() || inicio.getDate();

        const now = new Date();
        const periodoPrimera = toPeriod(now);
        const fechaPrimeraCuota = formatLocalYMD(now);

        return this.transaction(async (txQuery) => {
            const alquilerRepository = this.alquilerRepositoryFactory(txQuery);
            const id = await alquilerRepository.create({
                codigoEmpresa,
                codigoCliente,
                tipo: tipoNormalizado,
                marca: String(marca || '').trim() || null,
                numeroSerie: String(numeroSerie || '').trim() || null,
                observacion: String(observacion || '').trim() || null,
                montoMensual: monto,
                fechaInicio,
                diaCobro,
            });

            const alquiler = await alquilerRepository.getById(id, codigoEmpresa);

            await applyAlquilerChargeWithPedido(
                txQuery,
                {
                    chargeRepositoryFactory: this.chargeRepositoryFactory,
                },
                {
                    codigoEmpresa,
                    alquiler,
                    periodo: periodoPrimera,
                    fechaProgramada: fechaPrimeraCuota,
                    vendedorId,
                }
            );

            return alquiler;
        });
    }
}

module.exports = { CreateAlquiler };
