import { useEffect } from 'react';
import { useProductosStore } from '../stores/productosStore';
import ProductosToolbar from './ProductosToolbar';
import ProductosList from './ProductosList';

/**
 * Sección de Productos
 * Componente principal para la gestión de productos
 */
function ProductosSection() {
  const { loadProductos, isLoading, error } = useProductosStore();

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>🛍️</span>
          Gestión de Productos
        </h2>
        <p className="text-gray-600 mt-1">
          Administra tu catálogo de productos y stock
        </p>
      </div>

      <ProductosToolbar />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <ProductosList isLoading={isLoading} />
    </div>
  );
}

export default ProductosSection;
