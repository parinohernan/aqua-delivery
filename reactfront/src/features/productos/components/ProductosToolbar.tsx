import { useProductosStore } from '../stores/productosStore';
import { useState, useEffect } from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';

interface ProductosToolbarProps {
  onNewProduct: () => void;
}

function ProductosToolbar({ onNewProduct }: ProductosToolbarProps) {
  const { filters, setFilters, clearFilters } = useProductosStore();
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
      {/* Nuevo producto */}
      <button
        onClick={onNewProduct}
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
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 0 0 1px #00D1FF, 0 0 14px rgba(0,209,255,0.4)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        <Plus size={16} />
        Nuevo Producto
      </button>

      {/* Búsqueda */}
      <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
        <Search
          size={15}
          color="#94A3B8"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar productos..."
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

      {/* Filtro estado */}
      <select
        value={filters.activo}
        onChange={(e) =>
          setFilters({ activo: e.target.value as 'todos' | 'activos' | 'inactivos' })
        }
        style={selectStyle}
      >
        <option value="todos" style={{ background: '#1E1E1E' }}>Todos</option>
        <option value="activos" style={{ background: '#1E1E1E' }}>Activos</option>
        <option value="inactivos" style={{ background: '#1E1E1E' }}>Inactivos</option>
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

export default ProductosToolbar;
