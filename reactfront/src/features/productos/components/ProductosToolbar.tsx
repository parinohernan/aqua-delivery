import { useProductosStore } from '../stores/productosStore';
import { useState, useEffect } from 'react';

/**
 * Barra de herramientas de productos
 * Contiene búsqueda y filtros
 */
interface ProductosToolbarProps {
  onNewProduct: () => void;
}

function ProductosToolbar({ onNewProduct }: ProductosToolbarProps) {
  const { filters, setFilters, clearFilters } = useProductosStore();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    // Debounce de búsqueda
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setFilters({ search: value });
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleEstadoFilterChange = (value: string) => {
    setFilters({ activo: value as 'todos' | 'activos' | 'inactivos' });
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <button
        onClick={onNewProduct}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg hover:from-primary-500 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
      >
        <span>➕</span>
        <span>Nuevo Producto</span>
      </button>

      <div className="flex-1 min-w-[200px] relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
          🔍
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
        />
      </div>

      <select
        value={filters.activo}
        onChange={(e) => handleEstadoFilterChange(e.target.value)}
        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm"
      >
        <option value="todos" className="bg-[#0f1b2e]">Todos</option>
        <option value="activos" className="bg-[#0f1b2e]">Activos</option>
        <option value="inactivos" className="bg-[#0f1b2e]">Inactivos</option>
      </select>

      <button
        onClick={clearFilters}
        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm text-white"
        title="Limpiar filtros"
      >
        <span>🔄</span>
      </button>
    </div>
  );
}

export default ProductosToolbar;

