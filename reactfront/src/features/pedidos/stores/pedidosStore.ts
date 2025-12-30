import { create } from 'zustand';
import { pedidosService } from '../services/pedidosService';
import type { Pedido } from '@/types/entities';

/**
 * Filtros de pedidos
 */
interface PedidosFilters {
  search: string;
  estado: string;
  fecha: string;
  zona: string;
}

/**
 * Store de Pedidos
 */
interface PedidosState {
  pedidos: Pedido[];
  filteredPedidos: Pedido[];
  isLoading: boolean;
  error: string | null;
  filters: PedidosFilters;
  
  // Actions
  loadPedidos: () => Promise<void>;
  setFilters: (filters: Partial<PedidosFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  createPedido: (data: Partial<Pedido>) => Promise<void>;
  updatePedido: (id: number, data: Partial<Pedido>) => Promise<void>;
  deletePedido: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const initialFilters: PedidosFilters = {
  search: '',
  estado: 'pendient', // Por defecto solo pedidos pendientes para mejor rendimiento (valor del backend)
  fecha: '',
  zona: '',
};

export const usePedidosStore = create<PedidosState>((set, get) => ({
  pedidos: [],
  filteredPedidos: [],
  isLoading: false,
  error: null,
  filters: initialFilters,

  loadPedidos: async (incluirDetalles: boolean = false) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      // Cargar pedidos con filtro de estado desde el backend para mejor rendimiento
      const estado = filters.estado !== 'todos' ? filters.estado : undefined;
      const pedidos = await pedidosService.getAll(incluirDetalles, estado);
      set({ pedidos });
      get().applyFilters();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando pedidos';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters: Partial<PedidosFilters>) => {
    set((state) => {
      const newState = { ...state.filters, ...newFilters };
      // Si cambió el estado, recargar desde el backend
      if (newFilters.estado !== undefined && newFilters.estado !== state.filters.estado) {
        // Recargar pedidos con el nuevo filtro de estado
        setTimeout(() => {
          get().loadPedidos(false);
        }, 0);
      }
      return { filters: newState };
    });
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { pedidos, filters } = get();
    
    let filtered = [...pedidos];

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((pedido) => {
        const clienteNombre = pedido.cliente_nombre?.toLowerCase() || '';
        const codigo = pedido.codigo?.toString().toLowerCase() || '';
        return clienteNombre.includes(searchLower) || codigo.includes(searchLower);
      });
    }

    // Filtro de estado
    if (filters.estado !== 'todos') {
      filtered = filtered.filter((pedido) => pedido.estado === filters.estado);
    }

    // Filtro de fecha
    if (filters.fecha) {
      filtered = filtered.filter((pedido) => {
        if (!pedido.fecha) return false;
        const pedidoDate = new Date(pedido.fecha).toDateString();
        const filterDate = new Date(filters.fecha).toDateString();
        return pedidoDate === filterDate;
      });
    }

    set({ filteredPedidos: filtered });
  },

  createPedido: async (data: Partial<Pedido>) => {
    try {
      await pedidosService.create(data);
      await get().loadPedidos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creando pedido';
      set({ error: errorMessage });
      throw error;
    }
  },

  updatePedido: async (id: number, data: Partial<Pedido>) => {
    try {
      await pedidosService.update(id, data);
      await get().loadPedidos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando pedido';
      set({ error: errorMessage });
      throw error;
    }
  },

  deletePedido: async (id: number) => {
    try {
      await pedidosService.delete(id);
      await get().loadPedidos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando pedido';
      set({ error: errorMessage });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

