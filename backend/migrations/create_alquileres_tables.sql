CREATE TABLE IF NOT EXISTS cliente_alquileres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigoEmpresa BIGINT NOT NULL,
    codigoCliente BIGINT NOT NULL,
    tipo VARCHAR(120) NOT NULL,
    marca VARCHAR(120) NULL,
    numeroSerie VARCHAR(120) NULL,
    observacion TEXT NULL,
    montoMensual DECIMAL(12,2) NOT NULL,
    fechaInicio DATE NOT NULL,
    diaCobro TINYINT NOT NULL,
    estado ENUM('ACTIVO', 'CANCELADO') NOT NULL DEFAULT 'ACTIVO',
    fechaCancelacion DATETIME NULL,
    motivoCancelacion VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_alquileres_empresa_cliente_estado (codigoEmpresa, codigoCliente, estado),
    INDEX idx_alquileres_empresa_estado_dia (codigoEmpresa, estado, diaCobro)
);

CREATE TABLE IF NOT EXISTS cliente_alquileres_cargos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigoEmpresa BIGINT NOT NULL,
    alquilerId BIGINT NOT NULL,
    codigoCliente BIGINT NOT NULL,
    periodo CHAR(7) NOT NULL,
    fechaProgramada DATE NOT NULL,
    fechaAplicada DATETIME NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    estado ENUM('APLICADO', 'ANULADO') NOT NULL DEFAULT 'APLICADO',
    detalle VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_alquiler_periodo (codigoEmpresa, alquilerId, periodo),
    INDEX idx_cargos_empresa_cliente_periodo (codigoEmpresa, codigoCliente, periodo),
    CONSTRAINT fk_cargos_alquiler
        FOREIGN KEY (alquilerId) REFERENCES cliente_alquileres(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
