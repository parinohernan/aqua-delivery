import { useState } from 'react';
import { Pencil, Trash2, Package, DollarSign, Power, PowerOff } from 'lucide-react';
import { useProductosStore } from '../stores/productosStore';
import { formatCurrency } from '@/utils/formatters';
import ProductoModal from './ProductoModal';
import type { Producto } from '@/types/entities';

interface ProductoCardProps {
  producto: Producto;
}

function ProductoCard({ producto }: ProductoCardProps) {
  const { deleteProducto, updateProducto } = useProductosStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [hovered, setHovered] = useState(false);

  const nombre = producto.descripcion || producto.nombre || 'Sin nombre';
  const precio = producto.precio || 0;
  const stock = producto.stock || 0;
  const activo = producto.activo !== false;
  const imagen = (producto.imageURL || producto.imagen || '') as string;
  const imagenUrl =
    imagen ||
    'https://res.cloudinary.com/drgs7xuag/image/upload/v1764287946/aqua_product_generic_nwadej.png';

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto(producto.id);
      } catch {
        alert('Error eliminando producto');
      }
    }
  };

  const handleToggleActivo = async () => {
    try {
      await updateProducto(producto.id, { activo: !activo });
    } catch {
      alert('Error actualizando producto');
    }
  };

  // Stock level coloring
  const stockColor = stock === 0 ? '#EF4444' : stock < 5 ? '#F59E0B' : '#94A3B8';

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#1E1E1E',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 250ms ease, box-shadow 250ms ease',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.35s ease-out',
          opacity: activo ? 1 : 0.6,
        }}
      >
        {/* ── Imagen ──────────────────────────────────────────────── */}
        <div
          style={{
            width: '100%',
            height: '160px',
            background: '#141414',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={imagenUrl}
            alt={nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://res.cloudinary.com/drgs7xuag/image/upload/v1764287946/aqua_product_generic_nwadej.png';
            }}
          />
          {/* Badge activo/inactivo sobre la imagen */}
          <span
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '3px 9px',
              borderRadius: '999px',
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: activo ? '#22C55E' : '#EF4444',
              background: activo ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
              border: `1px solid ${activo ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
              backdropFilter: 'blur(6px)',
            }}
          >
            {activo ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>

        {/* ── Contenido ───────────────────────────────────────────── */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {/* Nombre */}
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#F1F5F9',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {nombre}
          </h3>

          {/* Precio + Stock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={14} color="#94A3B8" />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9' }}>
                {formatCurrency(precio)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={14} color={stockColor} />
              <span style={{ fontSize: '0.82rem', color: stockColor }}>
                {stock} unidades
                {stock === 0 && ' — Sin stock'}
                {stock > 0 && stock < 5 && ' — Stock bajo'}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            {/* Editar */}
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#E2E8F0',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background 200ms ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <Pencil size={14} />
              Editar
            </button>

            {/* Activar / Desactivar */}
            <button
              onClick={handleToggleActivo}
              title={activo ? 'Desactivar' : 'Activar'}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: `1px solid ${activo ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.35)'}`,
                background: 'transparent',
                color: activo ? '#F59E0B' : '#22C55E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 200ms ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = activo
                  ? 'rgba(245,158,11,0.1)'
                  : 'rgba(34,197,94,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {activo ? <PowerOff size={15} /> : <Power size={15} />}
            </button>

            {/* Eliminar */}
            <button
              onClick={handleDelete}
              title="Eliminar producto"
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent',
                color: '#EF4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 200ms ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <ProductoModal
        isOpen={showEditModal}
        producto={producto}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}

export default ProductoCard;
