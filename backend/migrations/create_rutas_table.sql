-- Tabla rutas: orden de clientes por zona para reparto
-- Un cliente aparece una vez por zona; orden define la secuencia de paradas

USE deliverydeagua;

CREATE TABLE IF NOT EXISTS rutas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigoEmpresa INT NOT NULL,
  zona VARCHAR(100) NOT NULL,
  codigoCliente INT NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_rutas_empresa_zona_cliente (codigoEmpresa, zona, codigoCliente),
  KEY idx_rutas_empresa_zona (codigoEmpresa, zona),
  KEY idx_rutas_orden (codigoEmpresa, zona, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
