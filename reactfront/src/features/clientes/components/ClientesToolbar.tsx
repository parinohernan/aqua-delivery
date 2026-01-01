import { useClientesStore } from '../stores/clientesStore';
import { useState, useEffect } from 'react';

/**
 * Barra de herramientas de clientes
 * Contiene búsqueda, filtros y botón de nuevo cliente
 */
interface ClientesToolbarProps {
  onNewClient: () => void;
}

function ClientesToolbar({ onNewClient }: ClientesToolbarProps) {
  const { filters, setFilters, clearFilters } = useClientesStore();
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

  const handleSaldoFilterChange = (value: string) => {
    setFilters({ saldo: value as 'todos' | 'positivo' | 'negativo' | 'cero' });
  };

  const handleRetornablesFilterChange = (value: string) => {
    setFilters({ retornables: value as 'todos' | 'con' | 'sin' });
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
        onClick={onNewClient}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg hover:from-primary-500 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
      >
        <span>➕</span>
        <span>Nuevo Cliente</span>
      </button>

      <div className="flex-1 min-w-[200px] relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
          🔍
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar clientes..."
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
        />
      </div>

      <select
        value={filters.saldo}
        onChange={(e) => handleSaldoFilterChange(e.target.value)}
        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm"
      >
        <option value="todos" className="bg-[#0f1b2e]">Todos</option>
        <option value="positivo" className="bg-[#0f1b2e]">Con deuda</option>
        <option value="negativo" className="bg-[#0f1b2e]">A favor</option>
        <option value="cero" className="bg-[#0f1b2e]">Sin saldo</option>
      </select>

      <select
        value={filters.retornables}
        onChange={(e) => handleRetornablesFilterChange(e.target.value)}
        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm"
      >
        <option value="todos" className="bg-[#0f1b2e]">Retornables</option>
        <option value="con" className="bg-[#0f1b2e]">Con retornables</option>
        <option value="sin" className="bg-[#0f1b2e]">Sin retornables</option>
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

export default ClientesToolbar;

