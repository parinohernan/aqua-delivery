import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useClientesStore } from '../stores/clientesStore';
import { tiposPagoService } from '@/features/pedidos/services/tiposPagoService';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { formatCurrency, formatFullName } from '@/utils/formatters';
import type { Cliente, TipoPago } from '@/types/entities';

/**
 * Modal para registrar un pago directo de un cliente
 */
interface ClientPaymentModalProps {
  isOpen: boolean;
  cliente: Cliente | null;
  onClose: () => void;
}

function ClientPaymentModal({ isOpen, cliente, onClose }: ClientPaymentModalProps) {
  const { loadClientes } = useClientesStore();
  
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [selectedTipoPago, setSelectedTipoPago] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [retornablesDevueltos, setRetornablesDevueltos] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tipos de pago cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadTiposPago();
      if (cliente) {
        // Inicializar retornables devueltos en 0
        setRetornablesDevueltos(0);
        setMonto('');
        setObservaciones('');
        setSelectedTipoPago('');
      }
    }
  }, [isOpen, cliente]);

  const loadTiposPago = async () => {
    try {
      setIsLoading(true);
      const allTipos = await tiposPagoService.getAll();
      // Solo tipos de pago que NO aplican saldo (para pagos directos)
      const tiposSinSaldo = allTipos.filter(tipo => {
        const aplicaSaldo = tiposPagoService.convertirAplicaSaldo(tipo.aplicaSaldo);
        return !aplicaSaldo;
      });
      setTiposPago(tiposSinSaldo);
    } catch (error) {
      console.error('Error cargando tipos de pago:', error);
      setError('Error cargando tipos de pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrementRetornables = () => {
    const maxRetornables = cliente?.retornables || 0;
    setRetornablesDevueltos(prev => Math.min(prev + 1, maxRetornables + 100)); // Permitir hasta 100 más de los que debe
  };

  const handleDecrementRetornables = () => {
    setRetornablesDevueltos(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cliente) {
      setError('No hay cliente seleccionado');
      return;
    }

    if (!selectedTipoPago) {
      setError('Debes seleccionar un tipo de pago');
      return;
    }

    const montoNum = parseFloat(monto) || 0;
    if (montoNum < 0) {
      setError('El monto no puede ser negativo');
      return;
    }

    try {
      setIsSubmitting(true);

      const clienteId = cliente.codigo || cliente.id;
      const paymentData = {
        clienteId: clienteId,
        tipoPagoId: Number(selectedTipoPago),
        monto: montoNum,
        observaciones: observaciones.trim() || undefined,
        retornablesDevueltos: retornablesDevueltos || 0,
      };

      console.log('💰 Registrando pago:', paymentData);

      const result = await apiClient.post(`${endpoints.pagos()}/cliente`, paymentData);

      // Recargar clientes
      await loadClientes();

      // Cerrar modal
      handleClose();

      // Mostrar mensaje de éxito
      let mensaje = `Cobro registrado correctamente.\n`;
      mensaje += `Monto: ${formatCurrency(montoNum)}\n`;
      mensaje += `Saldo anterior: ${formatCurrency(result.saldoAnterior || cliente.saldo || 0)}\n`;
      mensaje += `Nuevo saldo: ${formatCurrency(result.nuevoSaldo || 0)}`;
      
      if (retornablesDevueltos > 0) {
        mensaje += `\nRetornables devueltos: ${retornablesDevueltos}`;
      }

      alert(mensaje);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error registrando el cobro';
      setError(errorMessage);
      console.error('Error registrando pago:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTipoPago('');
    setMonto('');
    setRetornablesDevueltos(0);
    setObservaciones('');
    setError(null);
    onClose();
  };

  if (!isOpen || !cliente) return null;

  const saldoActual = typeof cliente.saldo === 'number' ? cliente.saldo : parseFloat(String(cliente.saldo || 0));
  const retornablesActuales = typeof cliente.retornables === 'number' ? cliente.retornables : parseFloat(String(cliente.retornables || 0));
  const montoNum = parseFloat(monto) || 0;
  const nuevoSaldo = saldoActual - montoNum;
  const nuevosRetornables = retornablesActuales - retornablesDevueltos;

  // Renderizar el modal usando Portal directamente en el body
  // Esto asegura que esté por encima de todo el contenido
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ isolation: 'isolate' }}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={handleClose}
        style={{ zIndex: 1 }}
      />

      {/* Modal */}
      <div 
        className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/20 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 2 }}
      >
        <div className="sticky top-0 bg-[#0f1b2e] backdrop-blur-xl border-b-2 border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h3 className="text-lg sm:text-xl font-bold text-white">💳 Registrar Cobro</h3>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white text-2xl sm:text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información del Cliente */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <div className="space-y-2 text-sm text-white/90">
              <div><strong>👤 Cliente:</strong> {formatFullName(cliente.nombre, cliente.apellido)}</div>
              {cliente.telefono && (
                <div><strong>📞 Teléfono:</strong> {cliente.telefono}</div>
              )}
              <div><strong>💰 Saldo actual:</strong> {formatCurrency(saldoActual)}</div>
              {retornablesActuales > 0 && (
                <div><strong>🔄 Retornables adeudados:</strong> {retornablesActuales}</div>
              )}
            </div>
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tipo de Pago *
            </label>
            <select
              value={selectedTipoPago}
              onChange={(e) => setSelectedTipoPago(e.target.value ? Number(e.target.value) : '')}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm disabled:opacity-50"
            >
              <option value="" className="bg-[#0f1b2e]">
                {isLoading ? 'Cargando tipos de pago...' : 'Seleccionar tipo de pago...'}
              </option>
              {tiposPago.map((tipo) => (
                <option key={tipo.id} value={tipo.id} className="bg-[#0f1b2e]">
                  {tipo.pago || tipo.nombre}
                </option>
              ))}
            </select>
            {tiposPago.length === 0 && !isLoading && (
              <p className="mt-1 text-xs text-red-300">
                No hay tipos de pago disponibles. Solo se muestran tipos que no aplican saldo.
              </p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Monto a Cobrar ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">$</span>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                step="0.01"
                min="0"
                required
                className="w-full pl-8 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-white/60">
              Ingresa el monto que el cliente está pagando (puede ser $0.00)
            </p>
          </div>

          {/* Retornables Devueltos */}
          {retornablesActuales > 0 && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                🔄 Retornables Devueltos
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecrementRetornables}
                    className="w-10 h-10 flex items-center justify-center border-2 border-yellow-500/50 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors font-bold text-lg backdrop-blur-sm"
                  >
                    −
                  </button>
                  <span className="font-semibold text-yellow-300 min-w-[3rem] text-center">
                    {retornablesDevueltos}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementRetornables}
                    className="w-10 h-10 flex items-center justify-center border-2 border-yellow-500/50 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors font-bold text-lg backdrop-blur-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-white/70">
                  de <span className="font-semibold text-yellow-300">{retornablesActuales}</span> retornables adeudados
                </span>
              </div>
              <p className="mt-1 text-xs text-white/60">
                Los envases devueltos se descontarán del saldo de retornables del cliente
              </p>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm resize-none"
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>

          {/* Resumen del Pago */}
          {selectedTipoPago && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg backdrop-blur-sm">
              <h5 className="font-semibold text-white mb-3">📋 Resumen del Pago</h5>
              <div className="space-y-2 text-sm text-white/90">
                <div>
                  <strong>💳 Tipo de pago:</strong> {tiposPago.find(t => t.id === Number(selectedTipoPago))?.pago || tiposPago.find(t => t.id === Number(selectedTipoPago))?.nombre}
                </div>
                <div>
                  <strong>💰 Monto:</strong> {formatCurrency(montoNum)}
                </div>
                <div>
                  <strong>💵 Saldo anterior:</strong> {formatCurrency(saldoActual)}
                </div>
                <div className={nuevoSaldo < 0 ? 'text-green-300' : nuevoSaldo > 0 ? 'text-red-300' : 'text-white/90'}>
                  <strong>💵 Nuevo saldo:</strong> {formatCurrency(nuevoSaldo)}
                  {nuevoSaldo < 0 && <span className="ml-2">(a favor)</span>}
                </div>
                {retornablesDevueltos > 0 && (
                  <>
                    <div>
                      <strong>🔄 Retornables devueltos:</strong> {retornablesDevueltos}
                    </div>
                    <div>
                      <strong>🔄 Nuevos retornables:</strong> {nuevosRetornables}
                      {nuevosRetornables < 0 && <span className="ml-2 text-green-300">(a favor)</span>}
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

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/20 backdrop-blur-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
            >
              {isSubmitting ? 'Registrando...' : '💳 Registrar Cobro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderizar usando Portal en el body para asegurar que esté por encima de todo
  return createPortal(modalContent, document.body);
}

export default ClientPaymentModal;
