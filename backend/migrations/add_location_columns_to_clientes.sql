-- Migración para agregar columnas de ubicación a la tabla clientes
-- Esta migración es opcional y solo se debe ejecutar si se desea soporte para ubicaciones GPS

-- Verificar si las columnas ya existen antes de agregarlas
-- Ejecutar solo si las columnas no existen

-- Agregar columna latitud si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'clientes' 
     AND COLUMN_NAME = 'latitud') = 0,
    'ALTER TABLE clientes ADD COLUMN latitud DECIMAL(10, 8) NULL COMMENT "Latitud GPS del cliente"',
    'SELECT "La columna latitud ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna longitud si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'clientes' 
     AND COLUMN_NAME = 'longitud') = 0,
    'ALTER TABLE clientes ADD COLUMN longitud DECIMAL(11, 8) NULL COMMENT "Longitud GPS del cliente"',
    'SELECT "La columna longitud ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que las columnas se crearon correctamente
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'clientes' 
AND COLUMN_NAME IN ('latitud', 'longitud')
ORDER BY COLUMN_NAME;

