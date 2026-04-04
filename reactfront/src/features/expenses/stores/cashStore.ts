import { create } from 'zustand';
import { cashService, CashSession, CashSummary, CajaListSession } from '../services/cashService';

interface CashState {
  activeSession: CashSession | null;
  summary: CashSummary | null;
  sessions: CajaListSession[];
  /** null = resumen de la caja abierta propia (si existe); número = sesión del historial. */
  viewingSessionId: number | null;
  isLoading: boolean;
  isSummaryLoading: boolean;

  fetchActiveSession: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  setViewingSession: (sessionId: number | null) => Promise<void>;
  openSession: (amount: number) => Promise<void>;
  closeSession: (montoReal: number) => Promise<void>;
  refreshSummary: () => Promise<void>;
}

export const useCashStore = create<CashState>((set, get) => ({
  activeSession: null,
  summary: null,
  sessions: [],
  viewingSessionId: null,
  isLoading: false,
  isSummaryLoading: false,

  fetchActiveSession: async () => {
    set({ isLoading: true });
    try {
      const response = await cashService.getActiveSession();
      const { viewingSessionId } = get();
      if (response.active && response.session) {
        set({ activeSession: response.session });
        if (viewingSessionId == null) {
          const summary = await cashService.getSummary(response.session.id);
          set({ summary });
        }
      } else {
        set({ activeSession: null });
        if (viewingSessionId == null) {
          set({ summary: null });
        }
      }
    } catch (err) {
      console.error('Error fetching active session:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSessions: async () => {
    try {
      const { sessions } = await cashService.listSessions();
      set({ sessions: sessions ?? [] });
    } catch (err) {
      console.error('Error fetching caja sessions:', err);
    }
  },

  setViewingSession: async (sessionId: number | null) => {
    set({ viewingSessionId: sessionId, isSummaryLoading: true });
    try {
      if (sessionId != null) {
        const summary = await cashService.getSummary(sessionId);
        set({ summary });
      } else {
        const { activeSession } = get();
        if (activeSession) {
          const summary = await cashService.getSummary(activeSession.id);
          set({ summary });
        } else {
          set({ summary: null });
        }
      }
    } catch (err) {
      console.error('Error loading caja summary:', err);
      set({ summary: null });
    } finally {
      set({ isSummaryLoading: false });
    }
  },

  openSession: async (amount: number) => {
    set({ isLoading: true });
    try {
      await cashService.openSession(amount);
      set({ viewingSessionId: null });
      await get().fetchActiveSession();
      await get().fetchSessions();
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
        montoFinalEsperado: summary.balanceEsperado,
      });
      set({ activeSession: null, summary: null, viewingSessionId: null });
      await get().fetchSessions();
    } catch (err) {
      console.error('Error closing session:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshSummary: async () => {
    const { activeSession, viewingSessionId } = get();
    const id = viewingSessionId ?? activeSession?.id;
    if (id == null) return;

    try {
      const summary = await cashService.getSummary(id);
      set({ summary });
    } catch (err) {
      console.error('Error refreshing summary:', err);
    }
  },
}));
