import { useEffect } from 'react';
import { usePedidosStore } from '../stores/pedidosStore';
import PedidosToolbar from './PedidosToolbar';
import PedidosList from './PedidosList';

/**
 * Sección de Pedidos
 * Componente principal para la gestión de pedidos
 * Mejorado con mejor jerarquía visual y espaciado consistente
 */
function PedidosSection() {
  const { loadPedidos, isLoading, error, filteredPedidos } = usePedidosStore();

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header más compacto y con mejor jerarquía */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xl shadow-lg shadow-primary-500/30">
              📦
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">
          Gestión de Pedidos
              </h1>
              <p className="text-white/60 text-sm mt-0.5">
          Administra y rastrea todos tus pedidos de entrega
        </p>
            </div>
          </div>
          {filteredPedidos.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="text-white/70 text-sm">Total:</span>
              <span className="text-white font-bold text-lg">{filteredPedidos.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar con mejor espaciado */}
      <div className="mb-6">
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
