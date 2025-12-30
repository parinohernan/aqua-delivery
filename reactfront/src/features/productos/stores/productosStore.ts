import { create } from 'zustand';
import { productosService } from '../services/productosService';
import type { Producto } from '@/types/entities';

/**
 * Filtros de productos
 */
interface ProductosFilters {
  search: string;
  activo: 'todos' | 'activos' | 'inactivos';
}

/**
 * Store de Productos
 */
interface ProductosState {
  productos: Producto[];
  filteredProductos: Producto[];
  isLoading: boolean;
  error: string | null;
  filters: ProductosFilters;
  
  // Actions
  loadProductos: () => Promise<void>;
  setFilters: (filters: Partial<ProductosFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  createProducto: (data: Partial<Producto>) => Promise<void>;
  updateProducto: (id: number, data: Partial<Producto>) => Promise<void>;
  deleteProducto: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const initialFilters: ProductosFilters = {
  search: '',
  activo: 'todos',
};

export const useProductosStore = create<ProductosState>((set, get) => ({
  productos: [],
  filteredProductos: [],
  isLoading: false,
  error: null,
  filters: initialFilters,

  loadProductos: async () => {
    set({ isLoading: true, error: null });
    try {
      const productos = await productosService.getAll();
      set({ productos });
      get().applyFilters();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando productos';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters: Partial<ProductosFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { productos, filters } = get();
    
    let filtered = [...productos];

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((producto) => {
        const nombre = producto.nombre?.toLowerCase() || '';
        const descripcion = producto.descripcion?.toLowerCase() || '';
        return nombre.includes(searchLower) || descripcion.includes(searchLower);
      });
    }

    // Filtro de estado activo
    if (filters.activo !== 'todos') {
      filtered = filtered.filter((producto) => {
        const activo = producto.activo !== false;
        return filters.activo === 'activos' ? activo : !activo;
      });
    }

    set({ filteredProductos: filtered });
  },

  createProducto: async (data: Partial<Producto>) => {
    try {
      await productosService.create(data);
      await get().loadProductos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creando producto';
      set({ error: errorMessage });
      throw error;
    }
  },

  updateProducto: async (id: number, data: Partial<Producto>) => {
    try {
      await productosService.update(id, data);
      await get().loadProductos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando producto';
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteProducto: async (id: number) => {
    try {
      await productosService.delete(id);
      await get().loadProductos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando producto';
      set({ error: errorMessage });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

