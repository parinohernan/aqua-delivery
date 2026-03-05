import { ShoppingCart } from 'lucide-react';
import { useProductosStore } from '../stores/productosStore';
import ProductoCard from './ProductoCard';

interface ProductosListProps {
  isLoading: boolean;
}

function ProductosList({ isLoading }: ProductosListProps) {
  const { filteredProductos } = useProductosStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0,209,255,0.2)',
            borderTopColor: '#00D1FF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Cargando productos...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (filteredProductos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0',
          gap: '12px',
        }}
      >
        <ShoppingCart size={40} color="#4B5563" />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E2E8F0', margin: 0 }}>
          No se encontraron productos
        </h4>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>
          Intenta con otros filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}
    >
      {filteredProductos.map((producto) => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ProductosList;
