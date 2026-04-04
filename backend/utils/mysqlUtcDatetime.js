/**
 * Literal DATETIME MySQL alineado al instante UTC del Date de JS.
 * La columna DATETIME no guarda zona; convención: valores en reloj UTC.
 */
function toMysqlUtcDatetime(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { toMysqlUtcDatetime };
