import { usePedidosStore } from '../stores/pedidosStore';
import PedidoCard from './PedidoCard';

/**
 * Lista de pedidos mejorada
 * Con animaciones fade-in, mejor loading state y empty state mejorado
 */
interface PedidosListProps {
  isLoading: boolean;
}

function PedidosList({ isLoading }: PedidosListProps) {
  const { filteredPedidos } = usePedidosStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-solid border-primary-500/30 border-r-primary-500"></div>
          <div className="absolute inset-0 inline-block animate-spin rounded-full h-16 w-16 border-4 border-solid border-transparent border-t-primary-400" style={{ animationDuration: '0.75s' }}></div>
        </div>
        <p className="mt-6 text-white/70 text-lg font-medium">Cargando pedidos...</p>
        <p className="mt-2 text-white/50 text-sm">Por favor espera un momento</p>
      </div>
    );
  }

  if (filteredPedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="relative mb-6">
          <div className="text-8xl opacity-20">📦</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>📦</div>
          </div>
        </div>
        <h4 className="text-2xl font-bold text-white mb-3">
          No se encontraron pedidos
        </h4>
        <p className="text-white/60 text-center max-w-md mb-6">
          No hay pedidos que coincidan con los filtros aplicados. 
          Intenta ajustar los filtros o crear un nuevo pedido.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Scroll to top to show toolbar
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            Ajustar Filtros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPedidos.map((pedido, index) => (
        <div
          key={pedido.id}
          style={{
            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
          }}
        >
          <PedidoCard pedido={pedido} />
        </div>
      ))}
    </div>
  );
}

export default PedidosList;

