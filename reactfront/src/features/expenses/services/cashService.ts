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
  sessionId?: number;
  vendedorId?: number;
  montoInicial: number;
  /** Cobros con tipo de pago "Contado" (entran al arqueo de efectivo). */
  totalCobrosContado: number;
  /** Transferencias y demás medios; no suman al balance de caja. */
  totalCobrosOtros: number;
  /** Igual que totalCobrosContado (compat API). */
  totalCobros?: number;
  totalGastos: number;
  balanceEsperado: number;
  estado: string;
  /** Solo cajas cerradas: fecha/hora de cierre. */
  fechaCierre?: string | null;
  /** Efectivo que debía haber según el cierre registrado. */
  montoEsperadoAlCierre?: number | null;
  /** Efectivo contado y entregado al cerrar. */
  montoRealEntregado?: number | null;
  /** real − esperado al cierre (positivo sobró, negativo faltó). */
  diferenciaArqueo?: number | null;
}

export interface CajaListSession {
  id: number;
  vendedorId: number;
  codigoEmpresa: number;
  montoInicial: number;
  estado: string;
  fechaApertura: string;
  fechaCierre?: string | null;
  montoRealEntregado?: number | null;
  montoFinalEsperado?: number | null;
  vendedorNombre?: string | null;
  vendedorApellido?: string | null;
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

  async listSessions(): Promise<{ sessions: CajaListSession[] }> {
    return apiClient.get('/api/caja/sessions');
  },

  async closeSession(payload: {
    sessionId: number;
    montoRealEntregado: number;
    montoFinalEsperado: number;
  }): Promise<{ success: boolean }> {
    return apiClient.post('/api/caja/close', payload);
  },
};
