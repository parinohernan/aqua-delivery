import { useState, useEffect } from 'react';
import { usePedidosStore } from '../stores/pedidosStore';
import { pedidosService } from '../services/pedidosService';
import { tiposPagoService } from '../services/tiposPagoService';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Pedido, TipoPago, PedidoItem } from '@/types/entities';

/**
 * Modal para entregar un pedido
 * Permite seleccionar tipo de pago, monto cobrado y retornables devueltos
 */
interface EntregarPedidoModalProps {
  isOpen: boolean;
  pedido: Pedido | null;
  onClose: () => void;
}

function EntregarPedidoModal({ isOpen, pedido, onClose }: EntregarPedidoModalProps) {
  const { loadPedidos } = usePedidosStore();
  
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [selectedTipoPago, setSelectedTipoPago] = useState<number | ''>('');
  const [montoCobrado, setMontoCobrado] = useState<string>('');
  const [retornablesDevueltos, setRetornablesDevueltos] = useState<number>(0);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [totalRetornables, setTotalRetornables] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tipos de pago y datos del pedido cuando se abre el modal
  useEffect(() => {
    if (isOpen && pedido) {
      loadData();
    }
  }, [isOpen, pedido]);

  // Actualizar monto cobrado cuando cambia el tipo de pago
  useEffect(() => {
    if (selectedTipoPago && tiposPago.length > 0) {
      const tipoPago = tiposPago.find(t => t.id === Number(selectedTipoPago));
      if (tipoPago) {
        const aplicaSaldo = tiposPagoService.convertirAplicaSaldo(tipoPago.aplicaSaldo);
        if (aplicaSaldo) {
          setMontoCobrado('0');
        } else if (pedido && (!montoCobrado || montoCobrado === '0.00')) {
          setMontoCobrado((pedido.total || 0).toFixed(2));
        }
      }
    }
  }, [selectedTipoPago, tiposPago, pedido, montoCobrado]);

  // Inicializar retornables cuando se cargan los items
  useEffect(() => {
    if (pedidoItems.length > 0 && pedido) {
      const total = pedidoItems.reduce((sum, item) => {
        // Verificar si el producto es retornable
        // El backend puede devolver esRetornable directamente en el item o en item.producto
        const esRetornable = (item as any)?.esRetornable === 1 || 
                            (item as any)?.esRetornable === true ||
                            (item.producto as any)?.esRetornable === 1 || 
                            (item.producto as any)?.esRetornable === true;
        return sum + (esRetornable ? item.cantidad : 0);
      }, 0);
      
      setTotalRetornables(total);
      setRetornablesDevueltos(total); // Por defecto, devolver todos
    }
  }, [pedidoItems, pedido]);

  const loadData = async () => {
    if (!pedido) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Timeout de seguridad: siempre desactivar loading después de 10 segundos
    const safetyTimeout = setTimeout(() => {
      console.warn('Timeout de seguridad: desactivando loading');
      setIsLoading(false);
    }, 10000);

    try {
      // Inicializar monto cobrado con el total del pedido (hacerlo primero, síncrono)
      // Asegurar que total sea un número antes de usar toFixed
      const totalPedido = typeof pedido.total === 'number' 
        ? pedido.total 
        : typeof pedido.total === 'string' 
          ? parseFloat(pedido.total) || 0 
          : 0;
      setMontoCobrado(totalPedido.toFixed(2));

      // Cargar detalles del pedido solo si no están disponibles
      // Si el pedido ya tiene items, usamos esos datos
      if (pedido.items && pedido.items.length > 0) {
        setPedidoItems(pedido.items);
      } else {
        // Intentar cargar detalles, pero no es crítico si falla
        // El backend espera el código del pedido, no el ID
        pedidosService.getById(Number(pedido.codigo || pedido.id))
          .then((pedidoCompleto) => {
            if (pedidoCompleto.items) {
              setPedidoItems(pedidoCompleto.items);
            }
          })
          .catch((error) => {
            console.warn('No se pudieron cargar los detalles del pedido, usando datos disponibles:', error);
            // No es crítico, el pedido ya tiene la información básica necesaria
          });
      }

      // Cargar tipos de pago (crítico para el funcionamiento)
      try {
        console.log('🔄 Iniciando carga de tipos de pago...');
        const tiposPagoData = await tiposPagoService.getAll();
        clearTimeout(safetyTimeout);
        console.log('✅ Tipos de pago cargados:', tiposPagoData);
        console.log('📊 Cantidad de tipos de pago:', tiposPagoData?.length || 0);
        
        if (tiposPagoData && tiposPagoData.length > 0) {
          setTiposPago(tiposPagoData);
          setError(null);
        } else {
          console.warn('⚠️ No se recibieron tipos de pago o el array está vacío');
          setError('No se encontraron tipos de pago disponibles.');
        }
        setIsLoading(false);
      } catch (error) {
        clearTimeout(safetyTimeout);
        console.error('❌ Error cargando tipos de pago:', error);
        console.error('❌ Detalles del error:', {
          message: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined,
        });
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(`Error cargando tipos de pago: ${errorMessage}. El modal seguirá funcionando.`);
        // Continuar aunque falle, para que el usuario pueda ver el pedido
        setIsLoading(false);
      }
    } catch (error) {
      clearTimeout(safetyTimeout);
      console.error('Error inesperado en loadData:', error);
      setError('Error cargando datos. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const getSelectedTipoPago = (): TipoPago | null => {
    if (!selectedTipoPago) return null;
    return tiposPago.find(t => t.id === Number(selectedTipoPago)) || null;
  };

  const aplicaSaldo = (): boolean => {
    const tipoPago = getSelectedTipoPago();
    if (!tipoPago) return false;
    return tiposPagoService.convertirAplicaSaldo(tipoPago.aplicaSaldo);
  };

  const showMontoCobrado = (): boolean => {
    return !aplicaSaldo();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pedido) {
      setError('No hay pedido seleccionado');
      return;
    }

    if (!selectedTipoPago) {
      setError('Debes seleccionar un tipo de pago');
      return;
    }

    try {
      setIsSubmitting(true);

      // El backend espera el código del pedido (puede ser string o number)
      const pedidoId = pedido.codigo || pedido.id;
      const tipoPagoId = Number(selectedTipoPago);
      const monto = parseFloat(montoCobrado) || 0;
      const totalPedido = pedido.total || 0;

      const entregaData = {
        tipoPago: tipoPagoId,
        montoCobrado: aplicaSaldo() ? 0 : monto,
        retornablesDevueltos: retornablesDevueltos,
        totalRetornables: totalRetornables,
        totalPedido: totalPedido,
      };

      console.log('🚚 Procesando entrega:', entregaData);

      // Usar el endpoint de entrega - el backend espera el código en la URL
      const pedidoIdForUrl = typeof pedidoId === 'string' ? pedidoId : String(pedidoId);
      await apiClient.post(`${endpoints.pedidos()}/${pedidoIdForUrl}/entregar`, entregaData);

      // Recargar pedidos
      await loadPedidos();

      // Cerrar modal
      handleClose();

      // Mostrar mensaje de éxito
      alert('Pedido entregado correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error procesando entrega';
      setError(errorMessage);
      console.error('Error procesando entrega:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTipoPago('');
    setMontoCobrado('');
    setRetornablesDevueltos(0);
    setError(null);
    onClose();
  };

  if (!isOpen || !pedido) return null;

  const tipoPago = getSelectedTipoPago();
  const totalPedido = pedido.total || 0;
  const monto = parseFloat(montoCobrado) || 0;
  const diferencia = totalPedido - monto;
  const retornablesNoDevueltos = totalRetornables - retornablesDevueltos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">🚚 Entregar Pedido</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Cargando datos del pedido...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información del Pedido */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>🧾 Pedido:</strong> #{pedido.codigo || pedido.id}</div>
                <div><strong>👤 Cliente:</strong> {pedido.cliente_nombre || 'Cliente sin nombre'}</div>
                {pedido.direccion && (
                  <div><strong>📍 Dirección:</strong> {pedido.direccion}</div>
                )}
                {pedido.fecha && (
                  <div><strong>📅 Fecha:</strong> {formatDate(pedido.fecha)}</div>
                )}
                <div><strong>💰 Total:</strong> {formatCurrency(totalPedido)}</div>
                {pedidoItems.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-300">
                    <div className="font-medium mb-1">📦 Productos:</div>
                    <div className="pl-2 space-y-1">
                      {pedidoItems.slice(0, 5).map((item, idx) => {
                        const esRetornable = (item.producto as any)?.esRetornable === 1 || 
                                            (item.producto as any)?.esRetornable === true ||
                                            (item as any)?.esRetornable === 1 ||
                                            (item as any)?.esRetornable === true;
                        // El backend devuelve nombre, producto_nombre, o descripcion directamente en el item
                        const nombreProducto = (item as any)?.nombre || 
                                             (item as any)?.producto_nombre || 
                                             (item as any)?.descripcion ||
                                             item.producto?.nombre ||
                                             item.producto?.descripcion ||
                                             'Producto';
                        return (
                          <div key={idx} className="text-xs">
                            {item.cantidad}x {nombreProducto}
                            {esRetornable && <span className="text-yellow-600"> 🔄</span>}
                          </div>
                        );
                      })}
                      {pedidoItems.length > 5 && (
                        <div className="text-xs text-gray-500">... y {pedidoItems.length - 5} más</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tipo de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Pago *
              </label>
              <select
                value={selectedTipoPago}
                onChange={(e) => setSelectedTipoPago(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={tiposPago.length === 0 && isLoading}
              >
                <option value="">
                  {isLoading ? 'Cargando tipos de pago...' : tiposPago.length === 0 ? 'No hay tipos de pago disponibles' : 'Seleccionar tipo de pago...'}
                </option>
                {tiposPago.map((tipo) => {
                  const aplicaSaldo = tiposPagoService.convertirAplicaSaldo(tipo.aplicaSaldo);
                  return (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.pago || tipo.nombre}{aplicaSaldo ? ' (Aplica saldo)' : ''}
                    </option>
                  );
                })}
              </select>
              {tiposPago.length === 0 && !isLoading && (
                <p className="mt-1 text-xs text-red-600">
                  No se pudieron cargar los tipos de pago. Por favor, recarga la página.
                </p>
              )}
            </div>

            {/* Monto Cobrado (solo si no aplica saldo) */}
            {showMontoCobrado() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Cobrado *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={montoCobrado}
                    onChange={(e) => setMontoCobrado(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Total del pedido: {formatCurrency(totalPedido)}. Puede cobrar más o menos del total.
                </p>
              </div>
            )}

            {/* Retornables (solo si hay productos retornables) */}
            {totalRetornables > 0 && (
              <div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                  <p className="text-sm text-yellow-900">
                    <strong>🔄 El pedido tiene {totalRetornables} retornables</strong>
                  </p>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuántos retornables entregó el cliente?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={retornablesDevueltos}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setRetornablesDevueltos(Math.max(0, Math.min(value, totalRetornables)));
                    }}
                    min="0"
                    max={totalRetornables}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">
                    de {totalRetornables} retornables adeudados
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Los retornables no entregados quedarán como adeudados en la cuenta del cliente.
                </p>
              </div>
            )}

            {/* Resumen de Entrega */}
            {selectedTipoPago && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-3">📋 Resumen de Entrega</h5>
                <div className="space-y-2 text-sm">
                  {aplicaSaldo() ? (
                    <>
                      <div>
                        <strong>💳 Pago:</strong> {tipoPago?.pago || tipoPago?.nombre} - Se aplicará a cuenta corriente
                      </div>
                      <div>
                        <strong>💰 Monto:</strong> {formatCurrency(totalPedido)} (se sumará al saldo del cliente)
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>💰 Pago:</strong> {tipoPago?.pago || tipoPago?.nombre} - {formatCurrency(monto)}
                      </div>
                      {diferencia !== 0 && (
                        <div className={diferencia > 0 ? 'text-red-600' : 'text-green-600'}>
                          <strong>📊 Diferencia:</strong> {formatCurrency(Math.abs(diferencia))} {diferencia > 0 ? '(faltante)' : '(vuelto)'}
                        </div>
                      )}
                    </>
                  )}
                  
                  {totalRetornables > 0 && (
                    <>
                      <div>
                        <strong>🔄 Retornables devueltos:</strong> {retornablesDevueltos} de {totalRetornables}
                      </div>
                      {retornablesNoDevueltos > 0 && (
                        <div className="text-yellow-600">
                          <strong>⚠️ Retornables pendientes:</strong> {retornablesNoDevueltos} (se sumarán al saldo del cliente)
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '🚚 Procesando entrega...' : '✅ Confirmar Entrega'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EntregarPedidoModal;

