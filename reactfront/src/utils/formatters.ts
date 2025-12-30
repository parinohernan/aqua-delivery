/**
 * Utilidades para formatear datos
 */

/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea una fecha
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Formatea un nombre completo
 */
export function formatFullName(nombre: string, apellido?: string): string {
  return `${nombre}${apellido ? ` ${apellido}` : ''}`.trim();
}

/**
 * Trunca un texto a una longitud máxima
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

