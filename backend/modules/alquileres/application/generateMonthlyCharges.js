const {
    toPeriod,
    getScheduledDateForPeriod,
    isDateOnOrAfter,
} = require('../domain/alquilerRules');
const { applyAlquilerChargeWithPedido } = require('../infrastructure/alquilerChargeWithPedidoSql');

class GenerateMonthlyCharges {
    constructor({
        transaction,
        alquilerRepositoryFactory,
        chargeRepositoryFactory,
        getDefaultVendedorIdForEmpresa,
    }) {
        this.transaction = transaction;
        this.alquilerRepositoryFactory = alquilerRepositoryFactory;
        this.chargeRepositoryFactory = chargeRepositoryFactory;
        this.getDefaultVendedorIdForEmpresa = getDefaultVendedorIdForEmpresa;
    }

    async executeForEmpresa({ codigoEmpresa, runDate = new Date() }) {
        const currentPeriod = toPeriod(runDate);
        const dueDateByPeriod = getScheduledDateForPeriod(currentPeriod, 1);
        const summary = { processed: 0, created: 0, skipped: 0 };

        const vendedorId = await this.getDefaultVendedorIdForEmpresa(codigoEmpresa);

        const alquileres = await this.alquilerRepositoryFactory().listActiveByEmpresa(codigoEmpresa);

        for (const alquiler of alquileres) {
            summary.processed += 1;
            const periodo = currentPeriod;
            const scheduledDate = getScheduledDateForPeriod(periodo, Number(alquiler.diaCobro));
            const inicio = new Date(alquiler.fechaInicio);

            if (!isDateOnOrAfter(runDate, scheduledDate)) {
                summary.skipped += 1;
                continue;
            }
            if (!isDateOnOrAfter(runDate, dueDateByPeriod) || !isDateOnOrAfter(scheduledDate, new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), 1)))) {
                summary.skipped += 1;
                continue;
            }

            const created = await this.tryCreateCharge({
                codigoEmpresa,
                alquiler,
                periodo,
                fechaProgramada: scheduledDate.toISOString().slice(0, 10),
                vendedorId,
            });
            if (created) summary.created += 1;
            else summary.skipped += 1;
        }

        return summary;
    }

    async tryCreateCharge({ codigoEmpresa, alquiler, periodo, fechaProgramada, vendedorId }) {
        try {
            await this.transaction(async (txQuery) => {
                await applyAlquilerChargeWithPedido(
                    txQuery,
                    {
                        chargeRepositoryFactory: this.chargeRepositoryFactory,
                    },
                    {
                        codigoEmpresa,
                        alquiler,
                        periodo,
                        fechaProgramada,
                        vendedorId,
                    }
                );
            });
            return true;
        } catch (error) {
            if (error && error.code === 'ER_DUP_ENTRY') {
                return false;
            }
            throw error;
        }
    }
}

module.exports = { GenerateMonthlyCharges };
