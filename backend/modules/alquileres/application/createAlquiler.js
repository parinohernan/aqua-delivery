class CreateAlquiler {
    constructor({ alquilerRepository, clienteSaldoGateway }) {
        this.alquilerRepository = alquilerRepository;
        this.clienteSaldoGateway = clienteSaldoGateway;
    }

    async execute({ codigoEmpresa, codigoCliente, tipo, marca, numeroSerie, observacion, montoMensual, fechaInicio }) {
        if (!codigoEmpresa || !codigoCliente) {
            throw new Error('codigoEmpresa y codigoCliente son requeridos');
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

        const clienteExiste = await this.clienteSaldoGateway.exists(codigoCliente, codigoEmpresa);
        if (!clienteExiste) {
            throw new Error('Cliente no encontrado');
        }

        const diaCobro = inicio.getUTCDate() || inicio.getDate();

        const id = await this.alquilerRepository.create({
            codigoEmpresa,
            codigoCliente,
            tipo: tipoNormalizado,
            marca: String(marca || '').trim() || null,
            numeroSerie: String(numeroSerie || '').trim() || null,
            observacion: String(observacion || '').trim() || null,
            montoMensual: monto,
            fechaInicio: fechaInicio,
            diaCobro,
        });

        return this.alquilerRepository.getById(id, codigoEmpresa);
    }
}

module.exports = { CreateAlquiler };
