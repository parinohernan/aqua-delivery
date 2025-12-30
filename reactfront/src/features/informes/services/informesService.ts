import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';

/**
 * Servicio de Informes
 * Maneja todas las operaciones relacionadas con informes
 */
class InformesService {
  /**
   * Genera un informe de resumen de ventas
   */
  async getResumenVentas(fechaInicio: string, fechaFin: string): Promise<unknown> {
    return await apiClient.get(endpoints.informes(), {
      params: {
        tipo: 'resumen',
        fechaInicio,
        fechaFin,
      },
    });
  }

  /**
   * Genera un informe detallado por cliente
   */
  async getDetalladoClientes(fechaInicio: string, fechaFin: string): Promise<unknown> {
    return await apiClient.get(endpoints.informes(), {
      params: {
        tipo: 'detallado',
        fechaInicio,
        fechaFin,
      },
    });
  }
}

export const informesService = new InformesService();
export default informesService;

