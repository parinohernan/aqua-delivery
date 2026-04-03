import { create } from 'zustand';
import { cashService, CashSession, CashSummary } from '../services/cashService';

interface CashState {
  activeSession: CashSession | null;
  summary: CashSummary | null;
  isLoading: boolean;
  
  fetchActiveSession: () => Promise<void>;
  openSession: (amount: number) => Promise<void>;
  closeSession: (montoReal: number) => Promise<void>;
  refreshSummary: () => Promise<void>;
}

export const useCashStore = create<CashState>((set, get) => ({
  activeSession: null,
  summary: null,
  isLoading: false,

  fetchActiveSession: async () => {
    set({ isLoading: true });
    try {
      const response = await cashService.getActiveSession();
      if (response.active && response.session) {
        set({ activeSession: response.session });
        const summary = await cashService.getSummary(response.session.id);
        set({ summary });
      } else {
        set({ activeSession: null, summary: null });
      }
    } catch (err) {
      console.error('Error fetching active session:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  openSession: async (amount: number) => {
    set({ isLoading: true });
    try {
      await cashService.openSession(amount);
      await get().fetchActiveSession();
    } catch (err) {
      console.error('Error opening session:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  closeSession: async (montoReal: number) => {
    const { activeSession, summary } = get();
    if (!activeSession || !summary) return;
    
    set({ isLoading: true });
    try {
      await cashService.closeSession({
        sessionId: activeSession.id,
        montoRealEntregado: montoReal,
        montoFinalEsperado: summary.balanceEsperado
      });
      set({ activeSession: null, summary: null });
    } catch (err) {
      console.error('Error closing session:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshSummary: async () => {
    const { activeSession } = get();
    if (!activeSession) return;
    
    try {
      const summary = await cashService.getSummary(activeSession.id);
      set({ summary });
    } catch (err) {
      console.error('Error refreshing summary:', err);
    }
  }
}));
