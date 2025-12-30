import { create } from 'zustand';
import { clientesService } from '../services/clientesService';
import type { Cliente } from '@/types/entities';

/**
 * Filtros de clientes
 */
interface ClientesFilters {
  search: string;
  saldo: 'todos' | 'positivo' | 'negativo' | 'cero';
  retornables: 'todos' | 'con' | 'sin';
}

/**
 * Store de Clientes
 * Maneja el estado y operaciones de clientes
 */
interface ClientesState {
  clientes: Cliente[];
  filteredClientes: Cliente[];
  isLoading: boolean;
  error: string | null;
  filters: ClientesFilters;
  
  // Actions
  loadClientes: () => Promise<void>;
  setFilters: (filters: Partial<ClientesFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  createCliente: (data: Partial<Cliente>) => Promise<void>;
  updateCliente: (id: number, data: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const initialFilters: ClientesFilters = {
  search: '',
  saldo: 'todos',
  retornables: 'todos',
};

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  filteredClientes: [],
  isLoading: false,
  error: null,
  filters: initialFilters,

  /**
   * Carga los clientes desde el servicio
   */
  loadClientes: async () => {
    set({ isLoading: true, error: null });
    try {
      const clientes = await clientesService.getAll();
      set({ clientes });
      get().applyFilters();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando clientes';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Establece los filtros
   */
  setFilters: (newFilters: Partial<ClientesFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  /**
   * Limpia todos los filtros
   */
  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  /**
   * Aplica los filtros a la lista de clientes
   */
  applyFilters: () => {
    const { clientes, filters } = get();
    
    let filtered = [...clientes];

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((cliente) => {
        const nombre = `${cliente.nombre} ${cliente.apellido || ''}`.toLowerCase();
        const telefono = cliente.telefono?.toLowerCase() || '';
        return nombre.includes(searchLower) || telefono.includes(searchLower);
      });
    }

    // Filtro de saldo
    if (filters.saldo !== 'todos') {
      filtered = filtered.filter((cliente) => {
        const saldo = cliente.saldo || 0;
        switch (filters.saldo) {
          case 'positivo':
            return saldo > 0;
          case 'negativo':
            return saldo < 0;
          case 'cero':
            return saldo === 0;
          default:
            return true;
        }
      });
    }

    // Filtro de retornables
    if (filters.retornables !== 'todos') {
      filtered = filtered.filter((cliente) => {
        const retornables = cliente.retornables || 0;
        return filters.retornables === 'con' ? retornables > 0 : retornables === 0;
      });
    }

    set({ filteredClientes: filtered });
  },

  /**
   * Crea un nuevo cliente
   */
  createCliente: async (data: Partial<Cliente>) => {
    try {
      await clientesService.create(data);
      await get().loadClientes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creando cliente';
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Actualiza un cliente
   */
  updateCliente: async (id: number, data: Partial<Cliente>) => {
    try {
      await clientesService.update(id, data);
      await get().loadClientes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando cliente';
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Elimina un cliente
   */
  deleteCliente: async (id: number) => {
    try {
      await clientesService.delete(id);
      await get().loadClientes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando cliente';
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Establece un error
   */
  setError: (error: string | null) => {
    set({ error });
  },
}));

