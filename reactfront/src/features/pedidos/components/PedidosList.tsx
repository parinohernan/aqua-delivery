import { usePedidosStore } from '../stores/pedidosStore';
import PedidoCard from './PedidoCard';

/**
 * Lista de pedidos
 * Muestra la lista de pedidos filtrados
 */
interface PedidosListProps {
  isLoading: boolean;
}

function PedidosList({ isLoading }: PedidosListProps) {
  const { filteredPedidos } = usePedidosStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Cargando pedidos...</p>
      </div>
    );
  }

  if (filteredPedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron pedidos
        </h4>
        <p className="text-gray-600">No hay pedidos que coincidan con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPedidos.map((pedido) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}
    </div>
  );
}

export default PedidosList;

