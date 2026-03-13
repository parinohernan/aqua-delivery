const { query } = require('../config/database');

/**
 * Actualiza la tabla rutas cuando un cliente cambia de zona:
 * - Zona nueva: inserta el cliente al inicio (orden 0) y desplaza el resto.
 * - Zona vieja: elimina al cliente y reordena (cierra huecos).
 * @param {number} codigoEmpresa
 * @param {number} codigoCliente
 * @param {string|null} zonaAnterior
 * @param {string|null} zonaNueva
 */
async function actualizarRutasPorCambioZona(codigoEmpresa, codigoCliente, zonaAnterior, zonaNueva) {
  const zonaAnt = zonaAnterior && String(zonaAnterior).trim() ? String(zonaAnterior).trim() : null;
  const zonaNew = zonaNueva && String(zonaNueva).trim() ? String(zonaNueva).trim() : null;

  if (zonaAnt === zonaNew) return;

  // B) Zona vieja: quitar cliente y reordenar
  if (zonaAnt) {
    await query(
      'DELETE FROM rutas WHERE codigoEmpresa = ? AND zona = ? AND codigoCliente = ?',
      [codigoEmpresa, zonaAnt, codigoCliente]
    );
    const restantes = await query(
      'SELECT id, orden FROM rutas WHERE codigoEmpresa = ? AND zona = ? ORDER BY orden ASC',
      [codigoEmpresa, zonaAnt]
    );
    for (let i = 0; i < restantes.length; i++) {
      await query('UPDATE rutas SET orden = ? WHERE id = ?', [i, restantes[i].id]);
    }
  }

  // A) Zona nueva: insertar al inicio (orden 0) y desplazar el resto
  if (zonaNew) {
    const existentes = await query(
      'SELECT id, orden FROM rutas WHERE codigoEmpresa = ? AND zona = ? ORDER BY orden ASC',
      [codigoEmpresa, zonaNew]
    );
    for (let j = existentes.length - 1; j >= 0; j--) {
      await query('UPDATE rutas SET orden = ? WHERE id = ?', [j + 1, existentes[j].id]);
    }
    await query(
      'INSERT INTO rutas (codigoEmpresa, zona, codigoCliente, orden) VALUES (?, ?, ?, 0)',
      [codigoEmpresa, zonaNew, codigoCliente]
    );
  }
}

module.exports = { actualizarRutasPorCambioZona };
