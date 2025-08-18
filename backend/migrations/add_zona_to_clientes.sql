-- Agregar campo zona a la tabla clientes
-- Este script agrega un campo zona a la tabla clientes para referenciar la zona del cliente

USE deliverydeagua;

-- Agregar columna zona a la tabla clientes
ALTER TABLE clientes 
ADD COLUMN zona VARCHAR(100) NULL AFTER direccion,
ADD INDEX idx_clientes_zona (zona);

-- Comentario: El campo zona almacenará el nombre de la zona del cliente
-- Se puede relacionar con la tabla zonas por el campo 'zona'
