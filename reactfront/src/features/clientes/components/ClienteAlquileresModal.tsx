import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast, confirm } from '@/utils/feedback';
import { AxiosError } from 'axios';
import type { Alquiler, Cliente } from '@/types/entities';
import { clientesService } from '../services/clientesService';
import { WHATSAPP_NUMBER_DIGITS } from '@/utils/constants';

interface ClienteAlquileresModalProps {
  isOpen: boolean;
  cliente: Cliente;
  onClose: () => void;
}

function ClienteAlquileresModal({ isOpen, cliente, onClose }: ClienteAlquileresModalProps) {
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [tipo, setTipo] = useState<string>('Dispenser frio calor');
  const [marca, setMarca] = useState<string>('');
  const [numeroSerie, setNumeroSerie] = useState<string>('');
  const [observacion, setObservacion] = useState<string>('');
  const [montoMensual, setMontoMensual] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const clienteId = Number(cliente.codigo || cliente.id);

  const loadAlquileres = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clientesService.getAlquileres(clienteId);
      setAlquileres(data);
    } catch (error) {
      toast.error('No se pudieron cargar los alquileres');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    if (isOpen) {
      loadAlquileres();
    }
  }, [isOpen, loadAlquileres]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo.trim()) {
      toast.error('Ingresá el tipo de alquiler');
      return;
    }
    if (!montoMensual || Number(montoMensual) <= 0) {
      toast.error('Ingresá un monto mensual válido');
      return;
    }
    try {
      setIsSaving(true);
      await clientesService.createAlquiler({
        codigoCliente: clienteId,
        tipo: tipo.trim(),
        marca: marca.trim() || undefined,
        numeroSerie: numeroSerie.trim() || undefined,
        observacion: observacion.trim() || undefined,
        montoMensual: Number(montoMensual),
        fechaInicio,
      });
      toast.success('Alquiler creado');
      setTipo('Dispenser frio calor');
      setMarca('');
      setNumeroSerie('');
      setObservacion('');
      setMontoMensual('');
      setFechaInicio(new Date().toISOString().slice(0, 10));
      await loadAlquileres();
    } catch (error) {
      toast.error('No se pudo crear el alquiler');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (alquilerId: number) => {
    const ok = await confirm({
      title: 'Cancelar alquiler',
      message: '¿Querés cancelar este alquiler? No se eliminará el historial.',
      confirmLabel: 'Cancelar alquiler',
      cancelLabel: 'Volver',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      await clientesService.cancelAlquiler(alquilerId);
      toast.success('Alquiler cancelado');
      await loadAlquileres();
    } catch (error) {
      const message = error instanceof AxiosError
        ? (error.response?.data as { error?: string } | undefined)?.error || error.message
        : 'No se pudo cancelar el alquiler';
      toast.error(message);
      console.error(error);
    }
  };

  if (!isOpen) return null;

  const formatDate = (value: string) => String(value).slice(0, 10);
  const buildContratoResumen = (alq: Alquiler) => {
    const nombre = `${cliente.nombre} ${cliente.apellido || ''}`.trim();
    return [
      'Resumen de alquiler',
      `Cliente: ${nombre}`,
      `Equipo: ${alq.tipo}`,
      `Marca: ${alq.marca || 'No especificada'}`,
      `Numero de serie: ${alq.numeroSerie || 'No especificado'}`,
      `Inicio: ${formatDate(alq.fechaInicio)}`,
      `Dia de cobro: ${alq.diaCobro} de cada mes (o ultimo dia si no existe)`,
      `Monto mensual: $${Number(alq.montoMensual).toFixed(2)}`,
      `Estado: ${alq.estado}`,
      `Observacion: ${alq.observacion || 'Sin observaciones'}`,
    ].join('\n');
  };

  const handleCopyContrato = async (alq: Alquiler) => {
    try {
      await navigator.clipboard.writeText(buildContratoResumen(alq));
      toast.success('Resumen copiado');
    } catch (error) {
      toast.error('No se pudo copiar el resumen');
      console.error(error);
    }
  };

  const handleSendWhatsapp = (alq: Alquiler) => {
    const phoneRaw = String(cliente.telefono || '').replace(/\D/g, '');
    const phone = phoneRaw || WHATSAPP_NUMBER_DIGITS;
    const text = encodeURIComponent(buildContratoResumen(alq));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0a2e1a] p-6 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Alquileres de {cliente.nombre}</h3>
          <button type="button" onClick={onClose} className="rounded px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white">
            ×
          </button>
        </div>

        <form onSubmit={handleCreate} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-2">
          <input
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder='Tipo (ej: "Dispenser frio calor")'
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2"
          />
          <input
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder='Marca (ej: "Samsung")'
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2"
          />
          <input
            value={numeroSerie}
            onChange={(e) => setNumeroSerie(e.target.value)}
            placeholder='Numero de serie'
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2"
          />
          <input
            type="number"
            min="1"
            step="0.01"
            value={montoMensual}
            onChange={(e) => setMontoMensual(e.target.value)}
            placeholder="Monto mensual"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2"
          />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2"
          />
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder='Observacion (ej: "dispenser usado en buenas condiciones")'
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 md:col-span-2"
            rows={2}
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-primary-500 px-3 py-2 font-semibold hover:bg-primary-600 disabled:opacity-50 md:col-span-2"
          >
            {isSaving ? 'Guardando...' : 'Agregar'}
          </button>
        </form>

        <div className="max-h-[45vh] overflow-auto rounded-xl border border-white/10">
          {isLoading ? (
            <div className="p-4 text-white/70">Cargando alquileres...</div>
          ) : alquileres.length === 0 ? (
            <div className="p-4 text-white/70">Este cliente no tiene alquileres todavía.</div>
          ) : (
            alquileres.map((alq) => (
              <div key={alq.id} className="flex items-center justify-between border-b border-white/10 p-4 last:border-b-0">
                <div>
                  <p className="font-semibold">{alq.tipo}</p>
                  <p className="text-sm text-white/70">
                    ${Number(alq.montoMensual).toFixed(2)} / mes · inicia {String(alq.fechaInicio).slice(0, 10)} · cobra cada dia {alq.diaCobro}
                  </p>
                  <p className="text-xs text-white/60">
                    Marca: {alq.marca || '-'} · Serie: {alq.numeroSerie || '-'}
                  </p>
                  {alq.observacion ? <p className="text-xs text-white/60">Obs: {alq.observacion}</p> : null}
                  <p className="text-xs text-white/60">Estado: {alq.estado}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyContrato(alq)}
                    className="rounded-lg border border-white/30 px-3 py-2 text-white/90 hover:bg-white/10"
                  >
                    Copiar resumen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendWhatsapp(alq)}
                    className="rounded-lg border border-green-400/40 px-3 py-2 text-green-300 hover:bg-green-500/10"
                  >
                    Enviar por WhatsApp
                  </button>
                  {alq.estado === 'ACTIVO' ? (
                    <button
                      type="button"
                      onClick={() => handleCancel(alq.id)}
                      className="rounded-lg border border-red-400/40 px-3 py-2 text-red-300 hover:bg-red-500/10"
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ClienteAlquileresModal;
