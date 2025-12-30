import { useState } from 'react';
import { usePedidosStore } from '../stores/pedidosStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import EntregarPedidoModal from './EntregarPedidoModal';
import type { Pedido } from '@/types/entities';

/**
 * Tarjeta de pedido
 * Muestra la información de un pedido
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendient':
        return 'bg-yellow-100 text-yellow-800';
      case 'proceso':
        return 'bg-blue-100 text-blue-800';
      case 'entregad':
        return 'bg-green-100 text-green-800';
      case 'anulado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'pendient':
        return 'PENDIENTE';
      case 'proceso':
        return 'EN PROCESO';
      case 'entregad':
        return 'ENTREGADO';
      case 'anulado':
        return 'ANULADO';
      default:
        return estado.toUpperCase();
    }
  };

  const handleEntregar = () => {
    setShowEntregarModal(true);
  };

  const handleCancelar = async () => {
    if (confirm('¿Cancelar este pedido?')) {
      try {
        await updatePedido(pedido.id, { estado: 'anulado' });
      } catch (error) {
        alert('Error cancelando pedido');
      }
    }
  };


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-900">#{id}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(estado)}`}>
          {getEstadoText(estado)}
        </span>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-gray-900 mb-1">{nombreCliente}</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {direccion && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{direccion}</span>
            </div>
          )}
          {pedido.fecha && (
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>{formatDate(pedido.fecha)}</span>
            </div>
          )}
        </div>
      </div>

      {pedido.items && pedido.items.length > 0 && (
        <div className="mb-3 text-sm text-gray-600">
          <div className="font-medium mb-1">Productos:</div>
          <div className="pl-2">
            {pedido.items.slice(0, 3).map((item, idx) => (
              <div key={idx}>
                {item.cantidad}x {item.producto?.nombre || 'Producto'}
              </div>
            ))}
            {pedido.items.length > 3 && (
              <div className="text-gray-500">... y {pedido.items.length - 3} más</div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-200">
        <span className="text-sm text-gray-600">Total:</span>
        <span className="font-bold text-lg text-green-600">{formatCurrency(total)}</span>
      </div>

      <div className="flex gap-2">
        {estado === 'pendient' && (
          <>
            <button
              onClick={handleEntregar}
              className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              ✅ Entregar
            </button>
            <button
              onClick={handleCancelar}
              className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
            >
              ❌
            </button>
          </>
        )}
        {estado === 'proceso' && (
          <button
            onClick={handleEntregar}
            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
          >
            ✅ Entregar
          </button>
        )}
        {estado === 'entregad' && (
          <button
            disabled
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg opacity-70 cursor-not-allowed"
          >
            ✅ Entregado
          </button>
        )}
        {estado === 'anulado' && (
          <button
            disabled
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg opacity-70 cursor-not-allowed"
          >
            ❌ Anulado
          </button>
        )}
        <button
          onClick={() => {
            alert('Funcionalidad de ver detalles en desarrollo');
          }}
          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
        >
          👁️
        </button>
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

