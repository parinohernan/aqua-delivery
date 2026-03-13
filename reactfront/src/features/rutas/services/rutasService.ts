import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { RutaItem, ClienteConOrden } from '@/types/entities';

/**
 * Servicio de Rutas de reparto
 */
class RutasService {
  /**
   * Obtiene el orden de clientes para una zona (solo codigoCliente y orden)
   */
  async getRutaByZona(zona: string): Promise<RutaItem[]> {
    return apiClient.get<RutaItem[]>(endpoints.rutasByZona(zona));
  }

  /**
   * Obtiene clientes de una zona con su orden actual (para planificar ruta)
   */
  async getClientesConOrdenByZona(zona: string): Promise<ClienteConOrden[]> {
    return apiClient.get<ClienteConOrden[]>(endpoints.rutasClientes(zona));
  }

  /**
   * Guarda el orden de reparto para una zona
   * @param zona Nombre de la zona
   * @param orden Array de codigoCliente en el orden deseado
   */
  async guardarOrden(zona: string, orden: number[]): Promise<{ success: boolean }> {
    return apiClient.put<{ success: boolean }>(endpoints.rutas(), { zona, orden });
  }
}

export const rutasService = new RutasService();
export default rutasService;
