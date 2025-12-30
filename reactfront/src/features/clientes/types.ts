import type { Cliente } from '@/types/entities';

/**
 * Tipos específicos de la feature de Clientes
 */

/**
 * Formulario de cliente
 */
export interface ClienteFormData extends Partial<Cliente> {
  nombre: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  zonaId?: number;
}

/**
 * Filtros de clientes
 */
export interface ClientesFilters {
  search: string;
  saldo: 'todos' | 'positivo' | 'negativo' | 'cero';
  retornables: 'todos' | 'con' | 'sin';
}

