const axios = require('axios');

async function getToken() {
    try {
        console.log('🔐 Obteniendo token de autenticación...');
        
        const response = await axios.post('http://localhost:8001/auth/login', {
            telegramId: '123456789',
            codigoEmpresa: 1
        });
        
        console.log('✅ Token obtenido:', response.data.token);
        return response.data.token;
        
    } catch (error) {
        console.error('❌ Error obteniendo token:', error.response?.data || error.message);
        return null;
    }
}

module.exports = { getToken };

// Si se ejecuta directamente
if (require.main === module) {
    getToken()
        .then(token => {
            if (token) {
                console.log('\n🎉 Token válido obtenido');
                console.log('📋 Token:', token);
            } else {
                console.log('\n💥 No se pudo obtener el token');
            }
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error:', error);
            process.exit(1);
        });
}
