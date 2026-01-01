import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { InformeResumen, InformeDetallado } from '../types';

/**
 * Servicio de Informes
 * Maneja todas las operaciones relacionadas con informes
 */
class InformesService {
  /**
   * Genera un informe de resumen de ventas
   * @param fechaDesde Fecha de inicio (YYYY-MM-DD)
   * @param fechaHasta Fecha de fin (YYYY-MM-DD)
   */
  async getResumenVentas(fechaDesde: string, fechaHasta: string): Promise<InformeResumen> {
    return await apiClient.get(`${endpoints.informes()}/ventas`, {
      params: {
        tipo: 'resumen',
        fechaDesde,
        fechaHasta,
      },
    });
  }

  /**
   * Genera un informe detallado por cliente
   * @param fechaDesde Fecha de inicio (YYYY-MM-DD)
   * @param fechaHasta Fecha de fin (YYYY-MM-DD)
   */
  async getDetalladoClientes(fechaDesde: string, fechaHasta: string): Promise<InformeDetallado> {
    return await apiClient.get(`${endpoints.informes()}/ventas`, {
      params: {
        tipo: 'detallado',
        fechaDesde,
        fechaHasta,
      },
    });
  }
}

export const informesService = new InformesService();
export default informesService;

