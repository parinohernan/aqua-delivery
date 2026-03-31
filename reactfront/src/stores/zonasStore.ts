import { create } from 'zustand';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';

export interface ZonaItem {
  id: number;
  zona: string;
}

interface ZonasState {
  zonas: ZonaItem[];
  isLoading: boolean;
  error: string | null;
  loadZonas: (options?: { force?: boolean }) => Promise<void>;
}

let inFlight: Promise<void> | null = null;

export const useZonasStore = create<ZonasState>((set, get) => ({
  zonas: [],
  isLoading: false,
  error: null,

  loadZonas: async (options) => {
    const force = options?.force === true;
    if (!force && get().zonas.length > 0) return;
    if (inFlight && !force) return inFlight;

    if (force && inFlight) {
      await inFlight;
    }
    if (!force && get().zonas.length > 0) return;

    if (!inFlight) {
      inFlight = (async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.get<ZonaItem[]>(endpoints.zonas());
          set({ zonas: data });
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Error cargando zonas';
          set({ error: message });
        } finally {
          set({ isLoading: false });
          inFlight = null;
        }
      })();
    }
    return inFlight;
  },
}));
