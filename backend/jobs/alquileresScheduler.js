const { alquilerRepositoryFactory, generateMonthlyChargesUseCase } = require('../modules/alquileres');

const DAY_MS = 24 * 60 * 60 * 1000;

async function runDailyAlquileresCharges() {
    try {
        const empresas = await alquilerRepositoryFactory().listEmpresasWithActiveAlquileres();
        if (!empresas.length) return;

        const useCase = generateMonthlyChargesUseCase();
        for (const codigoEmpresa of empresas) {
            await useCase.executeForEmpresa({ codigoEmpresa, runDate: new Date() });
        }
    } catch (error) {
        console.error('❌ Error en scheduler de alquileres:', error.message);
    }
}

function startAlquileresScheduler() {
    const initialDelayMs = 10 * 1000;
    setTimeout(() => {
        runDailyAlquileresCharges();
        setInterval(runDailyAlquileresCharges, DAY_MS);
    }, initialDelayMs);
}

module.exports = { startAlquileresScheduler, runDailyAlquileresCharges };
