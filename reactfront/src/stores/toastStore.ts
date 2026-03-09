import { create } from 'zustand';

/**
 * Store global para notificaciones Toast
 * Reemplaza alert() con notificaciones modernas y coherentes con la UI
 */

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastState {
  toast: Toast | null;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  hide: () => void;
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,

  success: (message: string, duration = 4000) => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = `toast-${Date.now()}`;
    set({ toast: { id, message, type: 'success', duration } });
    timeoutId = setTimeout(() => {
      set({ toast: null });
      timeoutId = null;
    }, duration);
  },

  error: (message: string, duration = 5000) => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = `toast-${Date.now()}`;
    set({ toast: { id, message, type: 'error', duration } });
    timeoutId = setTimeout(() => {
      set({ toast: null });
      timeoutId = null;
    }, duration);
  },

  info: (message: string, duration = 4000) => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = `toast-${Date.now()}`;
    set({ toast: { id, message, type: 'info', duration } });
    timeoutId = setTimeout(() => {
      set({ toast: null });
      timeoutId = null;
    }, duration);
  },

  hide: () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    set({ toast: null });
  },
}));
