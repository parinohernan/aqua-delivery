import { useState, useEffect, useRef } from 'react';
import { Package } from 'lucide-react';
import { usePedidosStore } from '../stores/pedidosStore';
import { useClientesStore } from '@/features/clientes/stores/clientesStore';
import { pedidosService } from '../services/pedidosService';
import { tiposPagoService } from '../services/tiposPagoService';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { toast } from '@/utils/feedback';
import { getCurrentPositionOnce } from '@/utils/geolocation';
import type { Pedido, TipoPago, PedidoItem } from '@/types/entities';

function tipoPagoDisplayName(t: TipoPago): string {
  const p = t.pago;
  if (typeof p === 'string' && p.trim()) return p;
  const n = (t as Record<string, unknown>).nombre;
  return typeof n === 'string' ? n : '';
}

/**
 * Modal para entregar un pedido
 * Permite seleccionar tipo de pago, monto cobrado y retornables devueltos
 */
interface EntregarPedidoModalProps {
  isOpen: boolean;
  pedido: Pedido | null;
  onClose: () => void;
  /** Tras entrega exitosa (antes de cerrar). `meta.clienteId` viene del API (fiable en /rutas). */
  onSuccess?: (pedido: Pedido, meta?: { clienteId?: number; clienteSaldo?: number; clienteRetornables?: number }) => void;
}

function EntregarPedidoModal({ isOpen, pedido, onClose, onSuccess }: EntregarPedidoModalProps) {
  const { loadPedidos } = usePedidosStore();
  const patchClienteBalances = useClientesStore((s) => s.patchClienteBalances);
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [selectedTipoPago, setSelectedTipoPago] = useState<number | ''>('');
  const [montoCobrado, setMontoCobrado] = useState<string>('');
  const [retornablesDevueltosInput, setRetornablesDevueltosInput] = useState<string>('');
  const [usarSaldoAFavor, setUsarSaldoAFavor] = useState(false);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [totalRetornables, setTotalRetornables] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Controlar apertura/cierre del dialog nativo
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && pedido) {
      dialog.showModal();
      loadData();
    } else {
      dialog.close();
    }
  }, [isOpen, pedido]);

  useEffect(() => {
    if (selectedTipoPago === '') return;
    const ok = tiposPago.some((t) => t.id === Number(selectedTipoPago));
    if (!ok) setSelectedTipoPago('');
  }, [tiposPago, selectedTipoPago]);

  // Sugerir total del pedido al cambiar de medio solo si el campo está vacío (0 es válido: nada en efectivo / cuenta)
  useEffect(() => {
    if (!selectedTipoPago || tiposPago.length === 0 || !pedido) return;
    const exists = tiposPago.some((t) => t.id === Number(selectedTipoPago));
    if (!exists) return;
    const emptyish = String(montoCobrado).trim() === '';
    if (emptyish) {
      setMontoCobrado((Number(pedido.total) || 0).toFixed(2));
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
      // Sin valor por defecto: el usuario debe ingresar cuántos entrega
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
      const totalPedidoInicial = Number(pedido.total) || 0;
      setMontoCobrado(totalPedidoInicial.toFixed(2));

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
          const paraEntrega = tiposPagoData.filter(
            (t) => !tiposPagoService.convertirAplicaSaldo(t.aplicaSaldo)
          );
          setTiposPago(paraEntrega);
          if (paraEntrega.length === 0) {
            setError(
              'No hay medios de pago para entrega: todos los tipos están marcados como "aplica saldo". Usá solo efectivo/transferencia u otros inmediatos, o desmarcá esa opción en configuración de tipos de pago.'
            );
          } else {
            setError(null);
          }
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

    const retornablesDevueltosNum = totalRetornables > 0
      ? (parseInt(retornablesDevueltosInput, 10) || 0)
      : 0;
    if (totalRetornables > 0 && (retornablesDevueltosInput === '' || Number.isNaN(parseInt(retornablesDevueltosInput, 10)))) {
      setError('Ingresá cuántos retornables entregó el cliente');
      return;
    }
    if (totalRetornables > 0 && retornablesDevueltosNum < 0) {
      setError('Los retornables entregados no pueden ser negativos');
      return;
    }

    try {
      setIsSubmitting(true);

      // El backend espera el código del pedido (puede ser string o number)
      const pedidoId = pedido.codigo || pedido.id;
      const tipoPagoId = Number(selectedTipoPago);
      const monto = parseFloat(montoCobrado) || 0;
      const totalPedidoNum = Number(pedido.total) || 0;

      const pagoConSaldoAFavor = usarSaldoAFavor;
      const pos = await getCurrentPositionOnce(10000);
      const entregaData: {
        tipoPago: number;
        montoCobrado: number;
        retornablesDevueltos: number;
        totalRetornables: number;
        totalPedido: number;
        usarSaldoAFavor?: boolean;
        latitud?: number;
        longitud?: number;
      } = {
        tipoPago: tipoPagoId,
        montoCobrado: pagoConSaldoAFavor ? 0 : monto,
        retornablesDevueltos: retornablesDevueltosNum,
        totalRetornables: totalRetornables,
        totalPedido: totalPedidoNum,
        ...(pagoConSaldoAFavor ? { usarSaldoAFavor: true as const } : {}),
      };
      if (pos) {
        entregaData.latitud = pos.latitude;
        entregaData.longitud = pos.longitude;
      }

      console.log('🚚 Procesando entrega:', entregaData);

      // Usar el endpoint de entrega - el backend espera el código en la URL
      const pedidoIdForUrl = typeof pedidoId === 'string' ? pedidoId : String(pedidoId);
      const entregaRes = await apiClient.post<{
        clienteId?: number;
        clienteSaldo?: number;
        clienteRetornables?: number;
      }>(`${endpoints.pedidos()}/${pedidoIdForUrl}/entregar`, entregaData);

      let clienteIdEntrega: number | undefined;
      if (entregaRes.clienteId != null) {
        const cid = Number(entregaRes.clienteId);
        if (Number.isFinite(cid)) {
          clienteIdEntrega = cid;
          patchClienteBalances(cid, {
            saldo: entregaRes.clienteSaldo,
            retornables: entregaRes.clienteRetornables,
          });
        }
      }

      // Recargar pedidos
      await loadPedidos();

      onSuccess?.(pedido, {
        clienteId: clienteIdEntrega,
        clienteSaldo: entregaRes.clienteSaldo,
        clienteRetornables: entregaRes.clienteRetornables,
      });

      // Cerrar modal
      handleClose();

      toast.success(
        pos
          ? 'Pedido entregado correctamente (ubicación registrada)'
          : 'Pedido entregado correctamente (sin ubicación GPS)'
      );
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
    setRetornablesDevueltosInput('');
    setUsarSaldoAFavor(false);
    setError(null);
    onClose();
  };

  const tipoPago = getSelectedTipoPago();
  const totalPedido = Number(pedido?.total) || 0;
  const monto = parseFloat(montoCobrado) || 0;
  const diferencia = totalPedido - monto;
  const retornablesDevueltos = totalRetornables > 0 ? (parseInt(retornablesDevueltosInput, 10) || 0) : 0;
  const retornablesNoDevueltos = totalRetornables - retornablesDevueltos;
  // Saldo del cliente: > 0 = debe, < 0 = a favor
  const saldoCliente = Number(pedido?.cliente_saldo ?? pedido?.cliente?.saldo ?? 0);
  const tieneDeuda = saldoCliente > 0;
  const tieneSaldoAFavor = saldoCliente < 0;
  const mostrarBloqueSaldo = tieneDeuda || tieneSaldoAFavor;
  const totalConDeuda = totalPedido + saldoCliente; // con deuda: suma; con crédito: totalPedido + (negativo) = resto a pagar
  const totalAPagarConCredito = Math.max(0, totalPedido + saldoCliente);
  // Nuevo saldo del cliente después del cobro: saldo + total pedido - monto cobrado
  const nuevoSaldoCliente = saldoCliente + totalPedido - monto;
  // Saldo retornables: > 0 = adeudados, < 0 = a favor
  const saldoRetornables = Number(pedido?.cliente_retornables ?? pedido?.cliente?.retornables ?? 0);
  const saldoRetornablesDespues = saldoRetornables + totalRetornables - retornablesDevueltos;

  if (!pedido) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full backdrop:bg-black/80 backdrop:backdrop-blur-md"
    >
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Click en el área vacía cierra el modal */}
        <div className="absolute inset-0" onClick={handleClose} />

        {/* Modal - Mejorado para mostrar contenido completo */}
        <div className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/20 w-full max-w-2xl my-auto flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header sticky */}
        <div className="sticky top-0 bg-[#0f1b2e]/95 backdrop-blur-xl border-b-2 border-white/20 px-4 sm:px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-white">🚚 Entregar Pedido</h3>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white text-2xl sm:text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-500/30 border-r-primary-500 mb-4"></div>
            <p className="text-white/70">Cargando datos del pedido...</p>
          </div>
        ) : (
            <form id="entregar-pedido-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Información del Pedido */}
            <div className="p-4 bg-primary-500/20 border border-primary-500/50 rounded-lg backdrop-blur-sm">
              <div className="space-y-2 text-sm text-white/90">
                <div><strong>🧾 Pedido:</strong> #{pedido.codigo || pedido.id}</div>
                <div><strong>👤 Cliente:</strong> {pedido.cliente_nombre || 'Cliente sin nombre'}</div>
                {pedido.direccion && (
                  <div><strong>📍 Dirección:</strong> {pedido.direccion}</div>
                )}
                {pedido.fecha && (
                  <div><strong>📅 Fecha:</strong> {formatDate(pedido.fecha)}</div>
                )}
                <div><strong>💰 Total:</strong> {formatCurrency(totalPedido)}</div>
                {mostrarBloqueSaldo && tieneDeuda && (
                  <>
                    <div className="text-amber-300"><strong>📋 Deuda anterior:</strong> {formatCurrency(saldoCliente)}</div>
                    <div className="text-amber-300 font-medium"><strong>💵 Total con deuda:</strong> {formatCurrency(totalConDeuda)}</div>
                  </>
                )}
                {mostrarBloqueSaldo && tieneSaldoAFavor && (
                  <>
                    <div className="text-emerald-300"><strong>📋 Saldo a favor:</strong> {formatCurrency(Math.abs(saldoCliente))}</div>
                    <div className="text-emerald-300 font-medium"><strong>💵 Total a pagar (después de descontar crédito):</strong> {formatCurrency(totalAPagarConCredito)}</div>
                  </>
                )}
                {(saldoRetornables !== 0 || (pedidoItems.length > 0 && totalRetornables > 0)) && (
                  <div className={saldoRetornables > 0 ? 'text-yellow-300' : saldoRetornables < 0 ? 'text-emerald-300' : 'text-white/90'}>
                    <strong>🔄 Saldo de retornables:</strong>{' '}
                    {saldoRetornables > 0
                      ? `${saldoRetornables} envase${saldoRetornables !== 1 ? 's' : ''} adeudados`
                      : saldoRetornables < 0
                        ? `${Math.abs(saldoRetornables)} envase${Math.abs(saldoRetornables) !== 1 ? 's' : ''} a favor`
                        : '0'}
                  </div>
                )}
                {pedidoItems.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-primary-500/30">
                    <div className="font-medium mb-1 text-white flex items-center gap-1.5"><Package size={15} /> Productos:</div>
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
                          <div key={idx} className="text-xs text-white/80">
                            {item.cantidad}x {nombreProducto}
                            {esRetornable && <span className="text-yellow-300"> 🔄</span>}
                          </div>
                        );
                      })}
                      {pedidoItems.length > 5 && (
                        <div className="text-xs text-white/60">... y {pedidoItems.length - 5} más</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tipo de Pago */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tipo de Pago *
              </label>
              <select
                name="tipoPago"
                value={selectedTipoPago}
                onChange={(e) => setSelectedTipoPago(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm disabled:opacity-50"
                disabled={tiposPago.length === 0 && isLoading}
              >
                <option value="" className="bg-[#0f1b2e]">
                  {isLoading ? 'Cargando tipos de pago...' : tiposPago.length === 0 ? 'No hay tipos de pago disponibles' : 'Seleccionar tipo de pago...'}
                </option>
                {tiposPago.map((tipo) => (
                  <option key={tipo.id} value={tipo.id} className="bg-[#0f1b2e]">
                    {tipoPagoDisplayName(tipo) || '—'}
                  </option>
                ))}
              </select>
              {tiposPago.length === 0 && !isLoading && (
                <p className="mt-1 text-xs text-red-300">
                  No se pudieron cargar los tipos de pago. Por favor, recarga la página.
                </p>
              )}
            </div>

            {/* Monto cobrado en el acto: 0 = todo queda en cuenta del cliente */}
            <div>
                {tieneSaldoAFavor && (
                  <label className="flex items-center gap-2 mb-3 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usarSaldoAFavor}
                      onChange={(e) => {
                        setUsarSaldoAFavor(e.target.checked);
                        if (e.target.checked) setMontoCobrado('0');
                      }}
                      className="rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-emerald-200 font-medium">Usar saldo a favor para este pedido</span>
                  </label>
                )}
                <label className="block text-sm font-medium text-white mb-2">
                  Monto Cobrado {usarSaldoAFavor ? '(no aplica)' : '*'}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    disabled={usarSaldoAFavor}
                    onClick={() => setMontoCobrado(totalPedido.toFixed(2))}
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Total ({formatCurrency(totalPedido)})
                  </button>
                  <button
                    type="button"
                    disabled={usarSaldoAFavor}
                    onClick={() => setMontoCobrado('0.00')}
                    title="Nada en efectivo: el pedido queda en cuenta del cliente"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-100 text-sm hover:bg-amber-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formatCurrency(0)}
                  </button>
                  {mostrarBloqueSaldo && (
                    <button
                      type="button"
                      disabled={usarSaldoAFavor}
                      onClick={() => setMontoCobrado(Math.max(0, totalPedido + saldoCliente).toFixed(2))}
                      className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tieneDeuda ? `Total + deuda (${formatCurrency(totalConDeuda)})` : `Total a pagar (${formatCurrency(totalAPagarConCredito)})`}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">$</span>
                  <input
                    type="number"
                    name="montoCobrado"
                    value={montoCobrado}
                    onChange={(e) => setMontoCobrado(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={usarSaldoAFavor}
                    className="w-full pl-8 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm disabled:opacity-60"
                    placeholder="0.00"
                  />
                </div>
                {!usarSaldoAFavor && (
                  <p className="mt-1 text-xs text-white/60">
                    Total del pedido: {formatCurrency(totalPedido)}. Podés cobrar menos (queda diferencia en cuenta) o más (vuelto / crédito). Con{' '}
                    <strong className="text-white/80">0</strong> no ingresa efectivo: todo el pedido suma al saldo del cliente.
                  </p>
                )}
              </div>

            {/* Retornables (solo si hay productos retornables) */}
            {totalRetornables > 0 && (
              <div>
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg mb-3 backdrop-blur-sm">
                  <p className="text-sm text-yellow-300">
                    <strong>🔄 Saldo retornables:</strong>{' '}
                    {saldoRetornables > 0
                      ? `${saldoRetornables} adeudados`
                      : saldoRetornables < 0
                        ? `${Math.abs(saldoRetornables)} a favor`
                        : '0'}
                    <span className="text-yellow-200/90"> · Envases del pedido: {totalRetornables}</span>
                    <span className="text-yellow-100 font-semibold">. Neto antes de esta entrega: {totalRetornables + saldoRetornables}</span>
                  </p>
                </div>
                
                <label className="block text-sm font-medium text-white mb-2">
                  ¿Cuántos retornables entregó el cliente?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={retornablesDevueltosInput}
                    onChange={(e) => setRetornablesDevueltosInput(e.target.value)}
                    min="0"
                    placeholder="—"
                    className="w-24 px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/40 backdrop-blur-sm"
                  />
                  <span className="text-sm text-white/70">
                    del pedido: {totalRetornables}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  Podés ingresar más de {totalRetornables} si el cliente devuelve envases de pedidos anteriores; el saldo de envases puede quedar a favor.
                </p>
              </div>
            )}

            {/* Resumen de Entrega */}
            {selectedTipoPago && (
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg backdrop-blur-sm">
                <h5 className="font-semibold text-white mb-3">📋 Resumen de Entrega</h5>
                <div className="space-y-2 text-sm text-white/90">
                  {usarSaldoAFavor ? (
                    <>
                      <div>
                        <strong>💳 Pago:</strong> {tipoPago ? tipoPagoDisplayName(tipoPago) : '—'} - Con saldo a favor
                      </div>
                      <div className="text-emerald-200">
                        <strong>💵 Se usará el saldo a favor</strong> para pagar este pedido ({formatCurrency(totalPedido)}). No se cobra efectivo.
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>💰 Pago:</strong> {tipoPago ? tipoPagoDisplayName(tipoPago) : '—'} - {formatCurrency(monto)}
                      </div>
                      {tieneDeuda && monto >= totalPedido && monto <= totalConDeuda && monto > totalPedido && (
                        <div className="text-white/90">
                          <strong>📋 Aplica a deuda anterior:</strong> {formatCurrency(monto - totalPedido)}
                        </div>
                      )}
                      {tieneDeuda && monto > totalConDeuda && (
                        <div className="text-green-300">
                          <strong>📊 Vuelto:</strong> {formatCurrency(monto - totalConDeuda)}
                        </div>
                      )}
                      {(tieneDeuda || tieneSaldoAFavor) && (
                        <div className={nuevoSaldoCliente > 0 ? 'text-amber-300' : nuevoSaldoCliente < 0 ? 'text-emerald-300' : 'text-white/90'}>
                          <strong>📊 Nuevo saldo:</strong>{' '}
                          {formatCurrency(Math.abs(nuevoSaldoCliente))}
                          {nuevoSaldoCliente > 0 ? ' a cobrar' : nuevoSaldoCliente < 0 ? ' a favor' : ''}
                        </div>
                      )}
                      {!tieneDeuda && !tieneSaldoAFavor && diferencia !== 0 && (
                        <div className={diferencia > 0 ? 'text-red-300' : 'text-green-300'}>
                          <strong>📊 Diferencia:</strong> {formatCurrency(Math.abs(diferencia))} {diferencia > 0 ? '(faltante)' : '(vuelto)'}
                        </div>
                      )}
                    </>
                  )}
                  
                  {(totalRetornables > 0 || saldoRetornables !== 0) && (
                    <>
                      <div>
                        <strong>🔄 Saldo retornables (actual):</strong>{' '}
                        {saldoRetornables > 0
                          ? `${saldoRetornables} envase${saldoRetornables !== 1 ? 's' : ''} adeudados`
                          : saldoRetornables < 0
                            ? `${Math.abs(saldoRetornables)} envase${Math.abs(saldoRetornables) !== 1 ? 's' : ''} a favor`
                            : '0'}
                      </div>
                      {totalRetornables > 0 && (
                        <div>
                          <strong>🔄 Retornables devueltos:</strong> {retornablesDevueltosInput === '' ? '—' : retornablesDevueltos} {retornablesDevueltos >= totalRetornables ? `(del pedido: ${totalRetornables})` : `de ${totalRetornables}`}
                          {retornablesNoDevueltos < 0 && (
                            <span className="text-emerald-300"> · El cliente devolvió más de lo que debía</span>
                          )}
                        </div>
                      )}
                      <div className="text-white/90">
                        <strong>🔄 Saldo retornables después de esta entrega:</strong>{' '}
                        {saldoRetornablesDespues >= 0
                          ? `${saldoRetornablesDespues} adeudados`
                          : `${Math.abs(saldoRetornablesDespues)} a favor`}
                        {totalRetornables > 0 && retornablesNoDevueltos > 0 && (
                          <span className="text-yellow-300"> ({retornablesNoDevueltos} pendiente{retornablesNoDevueltos !== 1 ? 's' : ''} de este pedido se sumarán al saldo)</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 backdrop-blur-sm">
                {error}
              </div>
            )}
          </form>
          )}
        </div>

        {/* Botones - Footer fijo siempre visible */}
        {!isLoading && (
          <div className="border-t-2 border-white/20 bg-[#0f1b2e]/95 backdrop-blur-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 border-2 border-white/20 backdrop-blur-sm font-semibold min-h-[48px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }}
                disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 font-bold min-h-[48px] hover:scale-[1.02] active:scale-[0.98]"
              >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                '✅ Confirmar Entrega'
              )}
              </button>
            </div>
        )}
        </div>
      </div>
    </dialog>
  );
}

export default EntregarPedidoModal;

