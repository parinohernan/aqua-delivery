ALTER TABLE cliente_alquileres
    MODIFY COLUMN tipo VARCHAR(120) NOT NULL,
    ADD COLUMN marca VARCHAR(120) NULL AFTER tipo,
    ADD COLUMN numeroSerie VARCHAR(120) NULL AFTER marca,
    ADD COLUMN observacion TEXT NULL AFTER numeroSerie;
