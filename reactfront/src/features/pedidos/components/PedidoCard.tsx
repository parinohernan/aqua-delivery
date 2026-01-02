import { useState } from 'react';
import { usePedidosStore } from '../stores/pedidosStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import EntregarPedidoModal from './EntregarPedidoModal';
import type { Pedido } from '@/types/entities';

/**
 * Tarjeta de pedido mejorada
 * Diseño con glassmorphism, mejor jerarquía visual y botones con peso visual correcto
 */
interface PedidoCardProps {
  pedido: Pedido;
}

function PedidoCard({ pedido }: PedidoCardProps) {
  const { updatePedido } = usePedidosStore();
  const [showEntregarModal, setShowEntregarModal] = useState(false);
  
  const id = pedido.codigo || pedido.id;
  const nombreCliente = pedido.cliente_nombre || 
    (pedido.cliente ? `${pedido.cliente.nombre || ''} ${pedido.cliente.apellido || ''}`.trim() : 'Cliente sin nombre');
  const direccion = pedido.direccion || 'Sin dirección';
  const total = pedido.total || 0;
  const estado = pedido.estado || 'pendiente';

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'pendient':
        return {
          text: 'PENDIENTE',
          bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
          border: 'border-amber-500/40',
          textColor: 'text-amber-300',
          badge: 'bg-amber-500/30 border-amber-500/50',
        };
      case 'proceso':
        return {
          text: 'EN PROCESO',
          bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/40',
          textColor: 'text-blue-300',
          badge: 'bg-blue-500/30 border-blue-500/50',
        };
      case 'entregad':
        return {
          text: 'ENTREGADO',
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/40',
          textColor: 'text-green-300',
          badge: 'bg-green-500/30 border-green-500/50',
        };
      case 'anulado':
        return {
          text: 'ANULADO',
          bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
          border: 'border-red-500/40',
          textColor: 'text-red-300',
          badge: 'bg-red-500/30 border-red-500/50',
        };
      default:
        return {
          text: estado.toUpperCase(),
          bg: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20',
          border: 'border-gray-500/40',
          textColor: 'text-gray-300',
          badge: 'bg-gray-500/30 border-gray-500/50',
        };
    }
  };

  const estadoConfig = getEstadoConfig(estado);

  const handleEntregar = () => {
    setShowEntregarModal(true);
  };

  const handleCancelar = async () => {
    if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
      try {
        await updatePedido(pedido.id, { estado: 'anulado' });
      } catch (error) {
        alert('Error cancelando pedido');
      }
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-white/8 backdrop-blur-md
        border-2 ${estadoConfig.border}
        transition-all duration-300 ease-out
        hover:bg-white/12 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/20
        group
      `}
      style={{
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      {/* Barra superior de estado con gradiente */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${estadoConfig.bg} ${estadoConfig.border}`} />

      {/* Header con número y estado */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">#{id}</span>
        </div>
        <span className={`
          px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
          ${estadoConfig.badge} ${estadoConfig.textColor} border
          backdrop-blur-sm
        `}>
          {estadoConfig.text}
        </span>
      </div>

      {/* Información del cliente */}
      <div className="mb-4">
        <h4 className="font-bold text-lg text-white mb-3 leading-tight">
          {nombreCliente}
        </h4>
        
        <div className="space-y-2 text-sm">
          {direccion && (
            <div className="flex items-start gap-2 text-white/80">
              <span className="text-base mt-0.5 flex-shrink-0">📍</span>
              <span className="line-clamp-2">{direccion}</span>
            </div>
          )}
          {pedido.fecha && (
            <div className="flex items-center gap-2 text-white/70">
              <span>📅</span>
              <span>{formatDate(pedido.fecha)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Productos preview */}
      {pedido.items && pedido.items.length > 0 && (
        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
            Productos
          </div>
          <div className="space-y-1 text-sm text-white/90">
            {pedido.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="truncate flex-1">{item.producto?.nombre || 'Producto'}</span>
                <span className="ml-2 px-2 py-0.5 bg-primary-500/20 text-primary-300 rounded text-xs font-semibold">
                  {item.cantidad}x
                </span>
              </div>
            ))}
            {pedido.items.length > 3 && (
              <div className="text-white/60 text-xs pt-1">
                ... y {pedido.items.length - 3} más
              </div>
            )}
          </div>
        </div>
      )}

      {/* Total destacado */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/70 uppercase tracking-wide">Total</span>
          <span className="text-2xl font-bold text-green-300 drop-shadow-lg">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Acciones con mejor jerarquía */}
      <div className="flex flex-col gap-2">
        {/* Botón principal - Entregar (más prominente) */}
        {(estado === 'pendient' || estado === 'proceso') && (
          <button
            onClick={handleEntregar}
            className="
              w-full px-4 py-3 
              bg-gradient-to-r from-green-500 to-emerald-600 
              text-white font-bold rounded-xl
              hover:from-green-600 hover:to-emerald-700 
              transition-all duration-200
              shadow-lg shadow-green-500/30 hover:shadow-green-500/50
              hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-2
              min-h-[44px]
            "
          >
            <span className="text-lg">✅</span>
            <span>Entregar</span>
          </button>
        )}

        {/* Estados finales */}
        {estado === 'entregad' && (
          <button
            disabled
            className="
              w-full px-4 py-3 
              bg-gradient-to-r from-gray-500/30 to-slate-500/30 
              text-gray-400 font-semibold rounded-xl
              cursor-not-allowed opacity-70
              flex items-center justify-center gap-2
              min-h-[44px]
            "
          >
            <span className="text-lg">✅</span>
            <span>Entregado</span>
          </button>
        )}

        {estado === 'anulado' && (
          <button
            disabled
            className="
              w-full px-4 py-3 
              bg-gradient-to-r from-red-500/30 to-rose-500/30 
              text-red-400 font-semibold rounded-xl
              cursor-not-allowed opacity-70
              flex items-center justify-center gap-2
              min-h-[44px]
            "
          >
            <span className="text-lg">❌</span>
            <span>Anulado</span>
          </button>
        )}

        {/* Botones secundarios en fila */}
        <div className="flex gap-2">
          {estado === 'pendient' && (
            <button
              onClick={handleCancelar}
              className="
                flex-1 px-3 py-2.5 
                bg-red-500/20 border-2 border-red-500/40 
                text-red-300 font-semibold rounded-xl
                hover:bg-red-500/30 hover:border-red-500/60
                transition-all duration-200
                flex items-center justify-center gap-1.5
                min-h-[44px]
              "
            >
              <span>❌</span>
              <span className="text-sm">Cancelar</span>
            </button>
          )}
          
        <button
          onClick={() => {
            alert('Funcionalidad de ver detalles en desarrollo');
          }}
            className="
              flex-1 px-3 py-2.5 
              bg-white/10 border-2 border-white/20 
              text-white font-semibold rounded-xl
              hover:bg-white/20 hover:border-white/30
              transition-all duration-200
              flex items-center justify-center gap-1.5
              min-h-[44px]
            "
        >
            <span>👁️</span>
            <span className="text-sm">Ver</span>
        </button>
        </div>
      </div>

      {/* Modal de Entrega */}
      <EntregarPedidoModal
        isOpen={showEntregarModal}
        pedido={pedido}
        onClose={() => setShowEntregarModal(false)}
      />
    </div>
  );
}

export default PedidoCard;

