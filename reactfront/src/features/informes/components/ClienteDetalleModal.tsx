import { createPortal } from 'react-dom';
import { formatCurrency, formatFullName } from '@/utils/formatters';
import type { ClienteDetallado } from '../types';

/**
 * Modal para mostrar detalles completos de un cliente
 */
interface ClienteDetalleModalProps {
  isOpen: boolean;
  cliente: ClienteDetallado | null;
  onClose: () => void;
}

function ClienteDetalleModal({ isOpen, cliente, onClose }: ClienteDetalleModalProps) {
  if (!isOpen || !cliente) return null;

  const nombreCompleto = formatFullName(cliente.nombre, cliente.apellido);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ isolation: 'isolate' }}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        style={{ zIndex: 1 }}
      />

      {/* Modal */}
      <div 
        className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/20 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0f1b2e] backdrop-blur-xl border-b-2 border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>👤</span>
              {nombreCompleto}
            </h3>
            {cliente.telefono && (
              <p className="text-sm text-white/70 mt-1">📞 {cliente.telefono}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl sm:text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-white/70 mb-1">Pedidos</p>
              <p className="text-2xl font-bold text-white">{cliente.totalPedidos}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-white/70 mb-1">Total Comprado</p>
              <p className="text-lg font-bold text-white">{formatCurrency(cliente.totalComprado)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 col-span-2 sm:col-span-1">
              <p className="text-xs text-white/70 mb-1">Productos</p>
              <p className="text-2xl font-bold text-white">{cliente.productos.length}</p>
            </div>
          </div>

          {/* Productos Comprados */}
          {cliente.productos.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>🛍️</span>
                Productos Comprados
              </h4>
              <div className="space-y-2">
                {cliente.productos.map((producto, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{producto.descripcion}</p>
                        <p className="text-xs text-white/70 mt-1">
                          {producto.pedidosConEsteProducto} {producto.pedidosConEsteProducto === 1 ? 'pedido' : 'pedidos'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-sm">
                          {formatCurrency(producto.totalPagado)}
                        </p>
                        <p className="text-xs text-white/70">
                          {producto.cantidadTotal} unidades
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-white/60">
                      Precio promedio: {formatCurrency(producto.precioPromedio)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pedidos Individuales */}
          {cliente.pedidos.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>📦</span>
                Pedidos ({cliente.pedidos.length})
              </h4>
              <div className="space-y-2">
                {cliente.pedidos.map((pedido) => (
                  <div
                    key={pedido.codigo}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">
                          Pedido #{pedido.codigo}
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          {new Date(pedido.fechaEntrega).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-sm">
                          {formatCurrency(pedido.total)}
                        </p>
                        <p className="text-xs text-white/70">
                          {pedido.cantidadItems} {pedido.cantidadItems === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ClienteDetalleModal;

