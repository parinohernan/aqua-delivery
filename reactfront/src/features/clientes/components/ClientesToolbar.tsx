import { useClientesStore } from '../stores/clientesStore';
import { useState, useEffect } from 'react';
import { Search, RotateCcw, UserPlus } from 'lucide-react';

/**
 * Barra de herramientas de clientes
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
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => setFilters({ search: value }), 300);
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    return () => { if (searchTimeout) clearTimeout(searchTimeout); };
  }, [searchTimeout]);

  const selectStyle: React.CSSProperties = {
    padding: '9px 14px',
    background: '#2A2A2A',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#E2E8F0',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
      {/* Nuevo cliente */}
      <button
        onClick={onNewClient}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '9px 16px',
          borderRadius: '10px',
          border: 'none',
          background: '#00D1FF',
          color: '#0B0E11',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'box-shadow 250ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 1px #00D1FF, 0 0 14px rgba(0,209,255,0.4)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        <UserPlus size={16} />
        Nuevo Cliente
      </button>

      {/* Búsqueda */}
      <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
        <Search
          size={15}
          color="#94A3B8"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar clientes..."
          style={{
            width: '100%',
            padding: '9px 14px 9px 36px',
            background: '#2A2A2A',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#E2E8F0',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filtro saldo */}
      <select
        value={filters.saldo}
        onChange={(e) => setFilters({ saldo: e.target.value as 'todos' | 'positivo' | 'negativo' | 'cero' })}
        style={selectStyle}
      >
        <option value="todos" style={{ background: '#1E1E1E' }}>Todos</option>
        <option value="positivo" style={{ background: '#1E1E1E' }}>Con deuda</option>
        <option value="negativo" style={{ background: '#1E1E1E' }}>A favor</option>
        <option value="cero" style={{ background: '#1E1E1E' }}>Sin saldo</option>
      </select>

      {/* Filtro retornables */}
      <select
        value={filters.retornables}
        onChange={(e) => setFilters({ retornables: e.target.value as 'todos' | 'con' | 'sin' })}
        style={selectStyle}
      >
        <option value="todos" style={{ background: '#1E1E1E' }}>Retornables</option>
        <option value="con" style={{ background: '#1E1E1E' }}>Con retornables</option>
        <option value="sin" style={{ background: '#1E1E1E' }}>Sin retornables</option>
      </select>

      {/* Limpiar filtros */}
      <button
        onClick={clearFilters}
        title="Limpiar filtros"
        style={{
          padding: '9px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent',
          color: '#94A3B8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 200ms ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <RotateCcw size={15} />
      </button>
    </div>
  );
}

export default ClientesToolbar;
