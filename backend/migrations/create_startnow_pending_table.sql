-- Solicitudes de alta pendientes de verificación por email (/startnow)

CREATE TABLE IF NOT EXISTS startnow_pending (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  razon_social VARCHAR(100) NOT NULL,
  telegram_id VARCHAR(50) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  usa_entrega_programada TINYINT(1) NOT NULL DEFAULT 0,
  usa_reparto_por_zona TINYINT(1) NOT NULL DEFAULT 0,
  huso_horario INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  UNIQUE KEY uk_startnow_email (email),
  INDEX idx_startnow_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
