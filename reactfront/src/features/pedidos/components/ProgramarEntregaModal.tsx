import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { usePedidosStore } from '../stores/pedidosStore';
import { pedidosService } from '../services/pedidosService';
import { toast } from '@/utils/feedback';
import { formatDateTimeShort } from '@/utils/formatters';
import type { Pedido } from '@/types/entities';

interface ProgramarEntregaModalProps {
  isOpen: boolean;
  pedido: Pedido | null;
  onClose: () => void;
}

function ProgramarEntregaModal({ isOpen, pedido, onClose }: ProgramarEntregaModalProps) {
  const { loadPedidos } = usePedidosStore();
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const [fechaProgramada, setFechaProgramada] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && pedido) {
      dialog.showModal();
      // Si ya tiene fecha programada, cargarla
      if (pedido.fecha_programada) {
        const fecha = new Date(pedido.fecha_programada);
        setFechaProgramada(toLocalDateTimeString(fecha));
      } else {
        // Por defecto, fecha de mañana a las 9:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        setFechaProgramada(toLocalDateTimeString(tomorrow));
      }
    } else {
      dialog.close();
    }
  }, [isOpen, pedido]);

  const toLocalDateTimeString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pedido) {
      setError('No hay pedido seleccionado');
      return;
    }

    if (!fechaProgramada) {
      setError('Debes seleccionar una fecha');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const pedidoId = pedido.codigo || pedido.id;
      await pedidosService.programar(Number(pedidoId), fechaProgramada);
      
      await loadPedidos();
      handleClose();
      
      const fechaFormateada = formatDateTimeShort(fechaProgramada);
      toast.success(`Entrega programada para ${fechaFormateada}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error programando entrega';
      setError(errorMessage);
      console.error('Error programando entrega:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFechaProgramada('');
    setError(null);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full backdrop:bg-black/80 backdrop:backdrop-blur-md"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="absolute inset-0" onClick={handleClose} />

        <div className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/20 w-full max-w-md">
          {/* Header */}
          <div className="border-b-2 border-white/20 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-primary-400" />
              Programar Entrega
            </h3>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Info del pedido */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-sm text-white/70">
                <span className="font-medium text-white">Pedido #{pedido?.codigo || pedido?.id}</span>
                {' · '}
                {pedido?.cliente_nombre || 'Cliente'}
              </p>
            </div>

            {/* Selector de fecha y hora */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Fecha y hora de entrega
              </label>
              <input
                type="datetime-local"
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm text-base"
                style={{ colorScheme: 'dark' }}
              />
              <p className="mt-2 text-xs text-white/50">
                Seleccioná la fecha y hora en que planeas entregar este pedido
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/20 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !fechaProgramada}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl hover:from-primary-500 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 font-bold"
              >
                {isSubmitting ? 'Guardando...' : 'Programar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}

export default ProgramarEntregaModal;
