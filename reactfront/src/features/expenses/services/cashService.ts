import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

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

export const cashService = {
  async getActiveSession(): Promise<{ active: boolean; session?: CashSession }> {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/api/caja/active`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },

  async openSession(montoInicial: number): Promise<{ success: boolean; id: number }> {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/api/caja/open`, { montoInicial }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },

  async getSummary(sessionId: number): Promise<CashSummary> {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/api/caja/summary/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },

  async closeSession(payload: { sessionId: number; montoRealEntregado: number; montoFinalEsperado: number }): Promise<{ success: boolean }> {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/api/caja/close`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }
};
