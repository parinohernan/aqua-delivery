import { useState, useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">💳 Registrar Cobro</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Cliente */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="space-y-2 text-sm">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pago *
            </label>
            <select
              value={selectedTipoPago}
              onChange={(e) => setSelectedTipoPago(e.target.value ? Number(e.target.value) : '')}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">
                {isLoading ? 'Cargando tipos de pago...' : 'Seleccionar tipo de pago...'}
              </option>
              {tiposPago.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.pago || tipo.nombre}
                </option>
              ))}
            </select>
            {tiposPago.length === 0 && !isLoading && (
              <p className="mt-1 text-xs text-red-600">
                No hay tipos de pago disponibles. Solo se muestran tipos que no aplican saldo.
              </p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a Cobrar ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                step="0.01"
                min="0"
                required
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Ingresa el monto que el cliente está pagando (puede ser $0.00)
            </p>
          </div>

          {/* Retornables Devueltos */}
          {retornablesActuales > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Retornables Devueltos
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecrementRetornables}
                    className="w-10 h-10 flex items-center justify-center border-2 border-yellow-500 bg-white text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="font-semibold text-yellow-600 min-w-[3rem] text-center">
                    {retornablesDevueltos}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementRetornables}
                    className="w-10 h-10 flex items-center justify-center border-2 border-yellow-500 bg-white text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  de <span className="font-semibold text-yellow-600">{retornablesActuales}</span> retornables adeudados
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Los envases devueltos se descontarán del saldo de retornables del cliente
              </p>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>

          {/* Resumen del Pago */}
          {selectedTipoPago && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-3">📋 Resumen del Pago</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>💳 Tipo de pago:</strong> {tiposPago.find(t => t.id === Number(selectedTipoPago))?.pago || tiposPago.find(t => t.id === Number(selectedTipoPago))?.nombre}
                </div>
                <div>
                  <strong>💰 Monto:</strong> {formatCurrency(montoNum)}
                </div>
                <div>
                  <strong>💵 Saldo anterior:</strong> {formatCurrency(saldoActual)}
                </div>
                <div className={nuevoSaldo < 0 ? 'text-green-600' : nuevoSaldo > 0 ? 'text-red-600' : ''}>
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
                      {nuevosRetornables < 0 && <span className="ml-2 text-green-600">(a favor)</span>}
                    </div>
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
              {isSubmitting ? 'Registrando...' : '💳 Registrar Cobro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientPaymentModal;
