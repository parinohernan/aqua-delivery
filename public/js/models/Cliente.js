class Cliente {
    constructor(id, nombre, apellido, direccion, lat, lng, saldoCorriente = 0, saldoEnvases = 0) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.direccion = direccion;
        this.lat = lat;
        this.lng = lng;
        this.saldoCorriente = saldoCorriente;
        this.saldoEnvases = saldoEnvases;
    }

    get nombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }

    get tieneSaldo() {
        return this.saldoCorriente > 0 || this.saldoEnvases > 0;
    }
}