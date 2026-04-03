-- eventos_gps: eventos georreferenciados por empresa y vendedor (entregas, combustible, check, etc.)
--
-- Timestamps:
--   ocurridoEn = momento lógico del hecho (entrega, parada, etc.); usar hora del servidor o la enviada en POST.
--   creadoEn   = inserción en BD (auditoría).
-- Aplicar en MySQL/MariaDB junto al despliegue del backend que usa esta tabla.

CREATE TABLE IF NOT EXISTS eventos_gps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigoEmpresa BIGINT NOT NULL,
    codigoVendedor BIGINT NOT NULL,
    evento VARCHAR(255) NOT NULL,
    numeroPedido VARCHAR(64) NULL,
    ocurridoEn DATETIME NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    creadoEn DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_eventos_gps_empresa_fecha (codigoEmpresa, ocurridoEn),
    INDEX idx_eventos_gps_empresa_vendedor_fecha (codigoEmpresa, codigoVendedor, ocurridoEn)
);
