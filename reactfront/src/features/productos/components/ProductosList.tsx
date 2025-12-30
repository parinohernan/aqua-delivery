import { useProductosStore } from '../stores/productosStore';
import ProductoCard from './ProductoCard';

/**
 * Lista de productos
 * Muestra la lista de productos filtrados
 */
interface ProductosListProps {
  isLoading: boolean;
}

function ProductosList({ isLoading }: ProductosListProps) {
  const { filteredProductos } = useProductosStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (filteredProductos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">🛍️</div>
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron productos
        </h4>
        <p className="text-gray-600">Intenta con otros filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProductos.map((producto) => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ProductosList;

