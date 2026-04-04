import apiClient from '@/services/api/client';

export interface CashSession {
  id: number;
  vendedorId: number;
  codigoEmpresa: number;
  montoInicial: number;
  montoFinalEsperado?: number;
  montoRealEntregado?: number;
  estado: 'abierta' | 'cerrada';
  fechaApertura: string;
  fechaCierre?: string;
}

export interface CashSummary {
  montoInicial: number;
  totalCobros: number;
  totalGastos: number;
  balanceEsperado: number;
  estado: string;
}

/** Usa el mismo baseURL que el resto de la app (red local, proxy, producción). */
export const cashService = {
  async getActiveSession(): Promise<{ active: boolean; session?: CashSession }> {
    return apiClient.get('/api/caja/active');
  },

  async openSession(montoInicial: number): Promise<{ success: boolean; id: number }> {
    return apiClient.post('/api/caja/open', { montoInicial });
  },

  async getSummary(sessionId: number): Promise<CashSummary> {
    return apiClient.get(`/api/caja/summary/${sessionId}`);
  },

  async closeSession(payload: {
    sessionId: number;
    montoRealEntregado: number;
    montoFinalEsperado: number;
  }): Promise<{ success: boolean }> {
    return apiClient.post('/api/caja/close', payload);
  },
};
