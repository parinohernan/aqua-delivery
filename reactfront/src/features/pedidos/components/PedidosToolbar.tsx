import { usePedidosStore } from '../stores/pedidosStore';
import { useState, useEffect, useMemo } from 'react';
import NewPedidoModal from './NewPedidoModal';

/**
 * Barra de herramientas de pedidos
 * Rediseñada con filtros horizontales compactos y chips de filtros activos
 */
function PedidosToolbar() {
  const { filters, setFilters, clearFilters } = usePedidosStore();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    setFilters({ estado: value });
  };

  const handleFechaFilterChange = (value: string) => {
    setFilters({ fecha: value });
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.fecha) count++;
    if (filters.zona) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendient: 'Pendientes',
      proceso: 'En Proceso',
      entregad: 'Entregados',
      anulado: 'Anulados',
      todos: 'Todos',
    };
    return labels[estado] || estado;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Fila principal: Botón nuevo pedido y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Botón Nuevo Pedido - Más prominente */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
          >
            <span className="text-lg">➕</span>
            <span>Nuevo Pedido</span>
          </button>

          {/* Búsqueda mejorada */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por cliente o número de pedido..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm transition-all hover:border-white/30"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('');
                  setFilters({ search: '' });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botón Mapa */}
          <button
            onClick={() => {
              alert('Funcionalidad de mapa en desarrollo');
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
          >
            <span className="text-lg">🗺️</span>
            <span className="hidden sm:inline">Mapa</span>
          </button>
        </div>

        {/* Fila de filtros rápidos */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro de estado con mejor diseño */}
          <div className="relative">
            <select
              value={filters.estado}
              onChange={(e) => handleEstadoFilterChange(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 bg-white/10 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-white backdrop-blur-sm transition-all hover:border-white/30 cursor-pointer min-h-[44px] font-medium"
            >
              <option value="pendient" className="bg-[#0f1b2e] text-white">📦 Pendientes</option>
              <option value="proceso" className="bg-[#0f1b2e] text-white">🔄 En Proceso</option>
              <option value="entregad" className="bg-[#0f1b2e] text-white">✅ Entregados</option>
              <option value="anulado" className="bg-[#0f1b2e] text-white">❌ Anulados</option>
              <option value="todos" className="bg-[#0f1b2e] text-white">📋 Todos</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
              ▼
            </span>
          </div>

          {/* Filtro de fecha */}
          <div className="relative">
            <input
              type="date"
              value={filters.fecha}
              onChange={(e) => handleFechaFilterChange(e.target.value)}
              className="px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-white backdrop-blur-sm transition-all hover:border-white/30 min-h-[44px] font-medium"
            />
          </div>

          {/* Chips de filtros activos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.search && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-lg text-white text-sm backdrop-blur-sm">
                  <span>🔍 {filters.search}</span>
                  <button
                    onClick={() => {
                      setSearchValue('');
                      setFilters({ search: '' });
                    }}
                    className="hover:text-primary-300 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.fecha && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-lg text-white text-sm backdrop-blur-sm">
                  <span>📅 {new Date(filters.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                  <button
                    onClick={() => setFilters({ fecha: '' })}
                    className="hover:text-primary-300 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Botón limpiar filtros - solo visible si hay filtros activos */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm text-white font-medium min-h-[44px]"
              title="Limpiar todos los filtros"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}

          {/* Indicador de filtro de estado activo */}
          {filters.estado !== 'pendient' && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm backdrop-blur-sm">
              <span>Estado: {getEstadoLabel(filters.estado)}</span>
            </div>
          )}
        </div>
      </div>

      <NewPedidoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default PedidosToolbar;

