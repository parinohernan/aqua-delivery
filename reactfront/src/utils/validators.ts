/**
 * Utilidades para validación de datos
 */

/**
 * Valida si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si un teléfono es válido
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

/**
 * Valida si un número es positivo
 */
export function isPositiveNumber(value: number): boolean {
  return value > 0;
}

/**
 * Valida si un string no está vacío
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida coordenadas de latitud
 */
export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Valida coordenadas de longitud
 */
export function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

