import { useEffect } from 'react';
import { usePedidosStore } from '../stores/pedidosStore';
import PedidosToolbar from './PedidosToolbar';
import PedidosList from './PedidosList';

/**
 * Sección de Pedidos
 * Componente principal para la gestión de pedidos
 */
function PedidosSection() {
  const { loadPedidos, isLoading, error } = usePedidosStore();

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📦</span>
          Gestión de Pedidos
        </h2>
        <p className="text-gray-600 mt-1">
          Administra y rastrea todos tus pedidos de entrega
        </p>
      </div>

      <PedidosToolbar />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <PedidosList isLoading={isLoading} />
    </div>
  );
}

export default PedidosSection;
