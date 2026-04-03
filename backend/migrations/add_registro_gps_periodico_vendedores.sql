-- Opt-in por vendedor: enviar registros GPS periódicos (Check) desde la PWA con pestaña visible.
-- Ejecutar una vez en MySQL/MariaDB junto al despliegue del backend que lee este campo.

ALTER TABLE vendedores
  ADD COLUMN registro_gps_periodico TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = habilitar POST /eventos-gps periódico (solo app abierta)';
