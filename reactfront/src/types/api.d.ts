/**
 * Tipos relacionados con las respuestas de la API
 */

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  token: string;
  user?: User;
  vendedor?: User;
}

/**
 * Respuesta de login
 */
export interface LoginResponse extends ApiResponse<AuthResponse> {
  token: string;
  user?: User;
  vendedor?: User;
}

/**
 * Parámetros de login
 */
export interface LoginParams {
  telegramId: string;
  codigoEmpresa: string;
}

/**
 * Filtros para listados
 */
export interface FilterParams {
  search?: string;
  fecha?: string;
  estado?: string;
  zona?: string;
  saldo?: string;
  retornables?: string;
  [key: string]: unknown;
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

import { User } from './entities';

