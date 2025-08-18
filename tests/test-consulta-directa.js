const mysql = require('mysql2/promise');

async function testConsultaDirecta() {
    console.log('🧪 TEST: Consulta directa a la base de datos');
    console.log('============================================');
    
    try {
        // Configuración de la base de datos
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'deliverydeagua'
        });
        
        console.log('✅ Conectado a la base de datos');
        
        // Simular exactamente la consulta del endpoint /entregar
        const [rows] = await connection.execute(
            'SELECT id, pago, aplicaSaldo FROM tiposdepago WHERE id = ? AND codigoEmpresa = ?',
            [4, 1]
        );
        
        console.log('📋 Resultado de la consulta:', rows);
        
        if (rows.length > 0) {
            const tipoPago = rows[0];
            console.log('\n💳 Tipo de pago encontrado:');
            console.log(`   📋 ID: ${tipoPago.id}`);
            console.log(`   💳 Nombre: ${tipoPago.pago}`);
            console.log(`   💰 aplicaSaldo raw:`, tipoPago.aplicaSaldo);
            console.log(`   💰 aplicaSaldo tipo:`, typeof tipoPago.aplicaSaldo);
            
            // Debug detallado
            console.log('\n🔍 DEBUG DETALLADO:');
            console.log(`   📝 tipoPago.aplicaSaldo:`, tipoPago.aplicaSaldo);
            console.log(`   📝 typeof tipoPago.aplicaSaldo:`, typeof tipoPago.aplicaSaldo);
            console.log(`   📝 tipoPago.aplicaSaldo.type:`, tipoPago.aplicaSaldo?.type);
            console.log(`   📝 tipoPago.aplicaSaldo.data:`, tipoPago.aplicaSaldo?.data);
            console.log(`   📝 tipoPago.aplicaSaldo.data[0]:`, tipoPago.aplicaSaldo?.data?.[0]);
            
            // Probar conversión
            let aplicaSaldo = false;
            if (tipoPago.aplicaSaldo && typeof tipoPago.aplicaSaldo === 'object' && tipoPago.aplicaSaldo.type === 'Buffer') {
                aplicaSaldo = tipoPago.aplicaSaldo.data[0] === 1;
                console.log(`   🔄 Es Buffer, data[0]: ${tipoPago.aplicaSaldo.data[0]}, resultado: ${aplicaSaldo}`);
            } else if (typeof tipoPago.aplicaSaldo === 'number') {
                aplicaSaldo = tipoPago.aplicaSaldo === 1;
                console.log(`   🔄 Es número, valor: ${tipoPago.aplicaSaldo}, resultado: ${aplicaSaldo}`);
            } else if (typeof tipoPago.aplicaSaldo === 'string') {
                aplicaSaldo = parseInt(tipoPago.aplicaSaldo) === 1;
                console.log(`   🔄 Es string, valor: "${tipoPago.aplicaSaldo}", resultado: ${aplicaSaldo}`);
            } else if (typeof tipoPago.aplicaSaldo === 'boolean') {
                aplicaSaldo = tipoPago.aplicaSaldo;
                console.log(`   🔄 Es boolean, valor: ${tipoPago.aplicaSaldo}`);
            }
            
            console.log(`   💰 aplicaSaldo convertido: ${aplicaSaldo}`);
            
            // Conversión directa
            console.log('\n🔄 CONVERSIÓN DIRECTA:');
            const aplicaSaldoDirecto = tipoPago.aplicaSaldo.data[0] === 1;
            console.log(`   📝 tipoPago.aplicaSaldo.data[0]: ${tipoPago.aplicaSaldo.data[0]}`);
            console.log(`   📝 aplicaSaldoDirecto: ${aplicaSaldoDirecto}`);
            
            if (aplicaSaldoDirecto) {
                console.log('✅ CORRECTO: aplicaSaldo es true para Cta Cte');
            } else {
                console.log('❌ PROBLEMA: aplicaSaldo debería ser true para Cta Cte');
            }
        } else {
            console.log('❌ No se encontró el tipo de pago');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar test
testConsultaDirecta()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
