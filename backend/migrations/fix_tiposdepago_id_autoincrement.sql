-- tiposdepago.id debe ser AUTO_INCREMENT: los INSERT (API y startnow) no envían id.
-- Error típico sin esto: ER_NO_DEFAULT_FOR_FIELD / "Field 'id' doesn't have a default value"
ALTER TABLE tiposdepago
  MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
