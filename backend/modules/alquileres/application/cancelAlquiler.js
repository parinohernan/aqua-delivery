class CancelAlquiler {
    constructor({ alquilerRepository }) {
        this.alquilerRepository = alquilerRepository;
    }

    async execute({ codigoEmpresa, alquilerId, motivoCancelacion }) {
        const alquiler = await this.alquilerRepository.getById(alquilerId, codigoEmpresa);
        if (!alquiler) {
            throw new Error('Alquiler no encontrado');
        }
        if (alquiler.estado !== 'ACTIVO') {
            throw new Error('El alquiler ya está cancelado');
        }

        await this.alquilerRepository.cancel(alquilerId, codigoEmpresa, motivoCancelacion);
        return this.alquilerRepository.getById(alquilerId, codigoEmpresa);
    }
}

module.exports = { CancelAlquiler };
