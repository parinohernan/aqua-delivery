import { usePedidosStore } from '../stores/pedidosStore';
import { useState, useEffect } from 'react';
import NewPedidoModal from './NewPedidoModal';

/**
 * Barra de herramientas de pedidos
 * Contiene búsqueda y filtros
 */
function PedidosToolbar() {
  const { filters, setFilters, clearFilters } = usePedidosStore();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <span>➕</span>
          <span>Nuevo Pedido</span>
        </button>

      <div className="flex-1 min-w-[200px] relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <select
        value={filters.estado}
        onChange={(e) => handleEstadoFilterChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="pendient">Pendientes</option>
        <option value="proceso">En proceso</option>
        <option value="entregad">Entregados</option>
        <option value="anulado">Anulados</option>
        <option value="todos">Todos (puede ser lento)</option>
      </select>

      <input
        type="date"
        value={filters.fecha}
        onChange={(e) => handleFechaFilterChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />

      <button
        onClick={clearFilters}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Limpiar filtros"
      >
        <span>🔄</span>
      </button>

      <button
        onClick={() => {
          alert('Funcionalidad de mapa en desarrollo');
        }}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        <span>🗺️</span>
        <span>Mapa</span>
      </button>
      </div>

      <NewPedidoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default PedidosToolbar;

