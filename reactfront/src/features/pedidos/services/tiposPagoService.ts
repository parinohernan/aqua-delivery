import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { TipoPago } from '@/types/entities';

/**
 * Servicio de Tipos de Pago
 * Maneja todas las operaciones relacionadas con tipos de pago
 */
class TiposPagoService {
  /**
   * Obtiene todos los tipos de pago
   */
  async getAll(): Promise<TipoPago[]> {
    try {
      const tiposPago = await apiClient.get<TipoPago[]>(endpoints.tiposPago());
      return tiposPago;
    } catch (error) {
      console.error('Error obteniendo tipos de pago:', error);
      throw error;
    }
  }

  /**
   * Obtiene un tipo de pago por ID
   */
  async getById(id: number): Promise<TipoPago> {
    return await apiClient.get<TipoPago>(endpoints.tipoPago(id));
  }

  /**
   * Convierte el valor de aplicaSaldo a boolean
   * Maneja diferentes formatos que puede devolver MySQL (Buffer, número, string, boolean)
   */
  convertirAplicaSaldo(aplicaSaldo: unknown): boolean {
    // Si es Buffer (MySQL BIT), verificar el primer byte
    if (aplicaSaldo && typeof aplicaSaldo === 'object' && 'type' in aplicaSaldo && aplicaSaldo.type === 'Buffer') {
      return (aplicaSaldo as { data: number[] }).data[0] === 1;
    }

    // Si es número, comparar con 1
    if (typeof aplicaSaldo === 'number') {
      return aplicaSaldo === 1;
    }

    // Si es string, convertir a número
    if (typeof aplicaSaldo === 'string') {
      return parseInt(aplicaSaldo) === 1;
    }

    // Si es boolean, retornar directamente
    if (typeof aplicaSaldo === 'boolean') {
      return aplicaSaldo;
    }

    // Por defecto, false
    return false;
  }
}

export const tiposPagoService = new TiposPagoService();
export default tiposPagoService;

