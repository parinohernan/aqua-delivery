import { useState } from 'react';
import { useProductosStore } from '../stores/productosStore';
import { formatCurrency } from '@/utils/formatters';
import ProductoModal from './ProductoModal';
import type { Producto } from '@/types/entities';

/**
 * Tarjeta de producto
 * Muestra la información de un producto
 */
interface ProductoCardProps {
  producto: Producto;
}

function ProductoCard({ producto }: ProductoCardProps) {
  const { deleteProducto, updateProducto } = useProductosStore();
  const [showEditModal, setShowEditModal] = useState(false);
  
  const nombre = producto.descripcion || producto.nombre || 'Sin nombre';
  const precio = producto.precio || 0;
  const stock = producto.stock || 0;
  const activo = producto.activo !== false;
  // El backend devuelve imageURL, pero también puede venir como imagen
  const imagen = (producto.imageURL || producto.imagen || '') as string;
  const imagenUrl = imagen || 'https://res.cloudinary.com/drgs7xuag/image/upload/v1764287946/aqua_product_generic_nwadej.png';

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto(producto.id);
      } catch (error) {
        alert('Error eliminando producto');
      }
    }
  };

  const handleToggleActivo = async () => {
    try {
      await updateProducto(producto.id, { activo: !activo });
    } catch (error) {
      alert('Error actualizando producto');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all shadow-lg">
      <div className="w-full h-48 bg-gray-900/50 flex items-center justify-center overflow-hidden">
        <img
          src={imagenUrl}
          alt={nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://res.cloudinary.com/drgs7xuag/image/upload/v1764287946/aqua_product_generic_nwadej.png';
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-white flex-1">{nombre}</h4>
          <span
            className={`px-2 py-1 rounded text-xs font-medium border ${
              activo
                ? 'bg-green-500/20 text-green-300 border-green-500/50'
                : 'bg-red-500/20 text-red-300 border-red-500/50'
            }`}
          >
            {activo ? '✓ Activo' : '✕ Inactivo'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>💰</span>
            <span className="font-semibold text-white">{formatCurrency(precio)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>📦</span>
            <span>{stock} unidades</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
          <button
            onClick={handleToggleActivo}
            className={`px-3 py-2 rounded-lg transition-all border backdrop-blur-sm ${
              activo
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/30'
                : 'bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/30'
            }`}
            title={activo ? 'Desactivar' : 'Activar'}
          >
            {activo ? '✕' : '✓'}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50 backdrop-blur-sm"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>

      {/* Modal de Edición */}
      <ProductoModal
        isOpen={showEditModal}
        producto={producto}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}

export default ProductoCard;

