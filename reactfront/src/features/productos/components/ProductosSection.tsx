import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useProductosStore } from '../stores/productosStore';
import ProductosToolbar from './ProductosToolbar';
import ProductosList from './ProductosList';
import ProductoModal from './ProductoModal';

function ProductosSection() {
  const { ensureProductosLoaded, isLoading, error } = useProductosStore();
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  useEffect(() => {
    ensureProductosLoaded().catch(console.error);
  }, [ensureProductosLoaded]);

  return (
    <div
      style={{
        background: '#161B22',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '24px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: 0,
          }}
        >
          <ShoppingBag size={22} color="#00D1FF" />
          Gestión de Productos
        </h2>
        <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.875rem' }}>
          Administra tu catálogo de productos y stock
        </p>
      </div>

      <ProductosToolbar onNewProduct={() => setIsNewProductModalOpen(true)} />

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#FCA5A5',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <ProductosList isLoading={isLoading} />

      <ProductoModal
        isOpen={isNewProductModalOpen}
        producto={null}
        onClose={() => setIsNewProductModalOpen(false)}
      />
    </div>
  );
}

export default ProductosSection;
