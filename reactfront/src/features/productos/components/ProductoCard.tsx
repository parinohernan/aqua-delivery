import { useProductosStore } from '../stores/productosStore';
import { formatCurrency } from '@/utils/formatters';
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
  
  const nombre = producto.descripcion || producto.nombre || 'Sin nombre';
  const precio = producto.precio || 0;
  const stock = producto.stock || 0;
  const activo = producto.activo !== false;
  const imagen = producto.imagen || 'https://res.cloudinary.com/drgs7xuag/image/upload/v1764287946/aqua_product_generic_nwadej.png';

  const handleEdit = () => {
    // TODO: Implementar modal de edición
    alert('Funcionalidad de edición en desarrollo');
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={imagen}
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
          <h4 className="font-semibold text-gray-900 flex-1">{nombre}</h4>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              activo
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {activo ? '✓ Activo' : '✕ Inactivo'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>💰</span>
            <span className="font-semibold text-gray-900">{formatCurrency(precio)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📦</span>
            <span>{stock} unidades</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
          <button
            onClick={handleToggleActivo}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activo
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={activo ? 'Desactivar' : 'Activar'}
          >
            {activo ? '✕' : '✓'}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductoCard;

