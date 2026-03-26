const {
    getLastDayOfMonth,
    getScheduledDateForPeriod,
} = require('../backend/modules/alquileres/domain/alquilerRules');
const { GenerateMonthlyCharges } = require('../backend/modules/alquileres/application/generateMonthlyCharges');

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}. esperado=${expected} actual=${actual}`);
    }
}

function createMockTransactionQuery() {
    return async (sql) => {
        const s = String(sql).toUpperCase();
        if (s.includes('INSERT INTO PEDIDOS')) {
            return { insertId: 9001 };
        }
        if (s.includes('INSERT INTO PRODUCTOS')) {
            return { insertId: 500 };
        }
        if (s.includes('FROM PRODUCTOS') && s.includes('SELECT')) {
            return [{ codigo: 500 }];
        }
        if (s.includes('ZONA') && s.includes('CLIENTES')) {
            return [{ zona: null }];
        }
        if (s.includes('INSERT INTO PEDIDOSITEMS')) {
            return { insertId: 1 };
        }
        return [];
    };
}

async function testReglaFinDeMes() {
    assertEqual(getLastDayOfMonth(2026, 2), 28, 'Febrero 2026 termina día 28');
    const d = getScheduledDateForPeriod('2026-02', 31);
    assertEqual(d.toISOString().slice(0, 10), '2026-02-28', 'Cobro cae en último día del mes');
}

async function testNoDuplicaCargosYActualizaSaldo() {
    const createdKeys = new Set();
    const alquileres = [{
        id: 10,
        codigoCliente: 99,
        diaCobro: 20,
        montoMensual: 15000,
        fechaInicio: '2026-01-20',
        tipo: 'Dispenser frio calor',
        marca: 'Samsung',
    }];

    const mockTx = createMockTransactionQuery();

    const useCase = new GenerateMonthlyCharges({
        transaction: async (cb) => cb(mockTx),
        alquilerRepositoryFactory: () => ({
            listActiveByEmpresa: async () => alquileres,
        }),
        chargeRepositoryFactory: () => ({
            createCharge: async ({ codigoEmpresa, alquilerId, periodo }) => {
                const key = `${codigoEmpresa}-${alquilerId}-${periodo}`;
                if (createdKeys.has(key)) {
                    const err = new Error('duplicado');
                    err.code = 'ER_DUP_ENTRY';
                    throw err;
                }
                createdKeys.add(key);
            },
        }),
        getDefaultVendedorIdForEmpresa: async () => 1,
    });

    const runDate = new Date('2026-02-21T12:00:00.000Z');
    const first = await useCase.executeForEmpresa({ codigoEmpresa: 1, runDate });
    const second = await useCase.executeForEmpresa({ codigoEmpresa: 1, runDate });

    assertEqual(first.created, 1, 'Primera ejecución crea 1 cargo');
    assertEqual(second.created, 0, 'Segunda ejecución no duplica cargo');
}

async function run() {
    await testReglaFinDeMes();
    await testNoDuplicaCargosYActualizaSaldo();
    console.log('✅ alquileres-fechas-idempotencia.test OK');
}

if (require.main === module) {
    run().catch((err) => {
        console.error('❌ Test falló:', err.message);
        process.exit(1);
    });
}

module.exports = { run };
