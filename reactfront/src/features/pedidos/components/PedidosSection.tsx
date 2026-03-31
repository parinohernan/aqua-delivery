import { useEffect } from 'react';
import { Package } from 'lucide-react';
import { usePedidosStore } from '../stores/pedidosStore';
import PedidosToolbar from './PedidosToolbar';
import PedidosList from './PedidosList';

/**
 * Sección de Pedidos
 * Componente principal para la gestión de pedidos
 * Mejorado con mejor jerarquía visual y espaciado consistente
 */
function PedidosSection() {
  const { ensurePedidosLoaded, isLoading, error, filteredPedidos } = usePedidosStore();

  useEffect(() => {
    ensurePedidosLoaded().catch(console.error);
  }, [ensurePedidosLoaded]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Package size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Pedidos</h1>
          {filteredPedidos.length > 0 && (
            <span className="text-white/50 text-sm font-medium">
              ({filteredPedidos.length})
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <PedidosToolbar />
      </div>

      {/* Mensaje de error mejorado */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-3 animate-fade-in">
          <span className="text-xl">⚠️</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Lista de pedidos */}
      <PedidosList isLoading={isLoading} />
    </div>
  );
}

export default PedidosSection;
