import { useState, useEffect, useMemo, useCallback, useRef, type MouseEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Save, ArrowRightLeft, MoreVertical, Plus, Truck } from 'lucide-react';
import NewPedidoModal from '@/features/pedidos/components/NewPedidoModal';
import EntregarPedidoModal from '@/features/pedidos/components/EntregarPedidoModal';
import { pedidosService } from '@/features/pedidos/services/pedidosService';
import type { Pedido } from '@/types/entities';
import { formatFullName } from '@/utils/formatters';
import { toast } from '@/utils/feedback';
import { rutasService } from '../services/rutasService';
import { reorderClientesRuta, type MoverModo } from '../utils/reorderRuta';
import type { ClienteConOrden } from '@/types/entities';
import { useRutasOrdenStore } from '@/stores/rutasOrdenStore';

function ordenCodigosIguales(a: ClienteConOrden[], b: ClienteConOrden[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, i) => row.codigoCliente === b[i]?.codigoCliente);
}

function pedidoMatchesCliente(p: Pedido, codigoCliente: number): boolean {
  const c = p.codigoCliente ?? p.clienteId;
  if (c === codigoCliente) return true;
  if (p.cliente?.id === codigoCliente) return true;
  const cod = (p.cliente as { codigo?: string | number } | undefined)?.codigo;
  return cod != null && Number(cod) === codigoCliente;
}

function getCodigoClienteDesdePedido(p: Pedido): number | null {
  const c = p.codigoCliente ?? p.clienteId;
  if (c != null && Number.isFinite(Number(c))) return Number(c);
  if (p.cliente?.id != null) return Number(p.cliente.id);
  const cod = (p.cliente as { codigo?: string | number } | undefined)?.codigo;
  return cod != null && Number.isFinite(Number(cod)) ? Number(cod) : null;
}

function pickPedidoParaEntregar(candidatos: Pedido[]): Pedido | null {
  const activos = candidatos.filter((p) => p.estado === 'pendient' || p.estado === 'proceso');
  if (activos.length === 0) return null;
  const rank = (e: string) => (e === 'pendient' ? 0 : e === 'proceso' ? 1 : 9);
  activos.sort((a, b) => {
    const dr = rank(a.estado) - rank(b.estado);
    if (dr !== 0) return dr;
    const fa = a.fecha_pedido || a.fecha || '';
    const fb = b.fecha_pedido || b.fecha || '';
    return String(fa).localeCompare(String(fb));
  });
  return activos[0] ?? null;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function whatsappHref(telefono: string | undefined): string | null {
  if (!telefono || !telefono.trim()) return null;
  const digits = telefono.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

interface RutaOrdenListProps {
  zona: string;
  clientes: ClienteConOrden[];
  onSaved: () => void;
}

type MoverTab = MoverModo;

function MoverModal({
  cliente,
  clientes,
  onClose,
  onApply,
}: {
  cliente: ClienteConOrden;
  clientes: ClienteConOrden[];
  onClose: () => void;
  onApply: (modo: MoverTab, refCodigo: number | undefined, positionN: number | undefined) => void;
}) {
  const [tab, setTab] = useState<MoverTab>('after');
  const [refCodigo, setRefCodigo] = useState<string>('');
  const [posStr, setPosStr] = useState<string>('');

  const otros = clientes.filter((c) => c.codigoCliente !== cliente.codigoCliente);
  const nombreMover = formatFullName(cliente.nombre, cliente.apellido);

  const handleAplicar = () => {
    if (tab === 'position') {
      const n = parseInt(posStr, 10);
      if (!Number.isFinite(n) || n < 1 || n > clientes.length) {
        toast.error(`Ingresá una posición entre 1 y ${clientes.length}`);
        return;
      }
      onApply('position', undefined, n);
      onClose();
      return;
    }
    const ref = parseInt(refCodigo, 10);
    if (!Number.isFinite(ref)) {
      toast.error('Elegí un cliente de referencia');
      return;
    }
    if (ref === cliente.codigoCliente) {
      toast.error('Elegí otro cliente');
      return;
    }
    onApply(tab, ref, undefined);
    onClose();
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mover-ruta-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-white/15 bg-[#0f1b2e] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0f1b2e] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h2 id="mover-ruta-title" className="text-lg font-bold text-white pr-2">
            Mover: {nombreMover}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-white/65">
            Elegí cómo reubicar en la ruta (recordá guardar el orden después).
          </p>

          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer has-[:checked]:border-primary-500/50 has-[:checked]:bg-primary-500/10">
              <input
                type="radio"
                name="mover-tab"
                checked={tab === 'before'}
                onChange={() => setTab('before')}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-white block">Antes de…</span>
                <span className="text-xs text-white/55">Queda inmediatamente antes del cliente que elijas</span>
              </span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer has-[:checked]:border-primary-500/50 has-[:checked]:bg-primary-500/10">
              <input
                type="radio"
                name="mover-tab"
                checked={tab === 'after'}
                onChange={() => setTab('after')}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-white block">Después de…</span>
                <span className="text-xs text-white/55">Queda inmediatamente después del cliente que elijas</span>
              </span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer has-[:checked]:border-primary-500/50 has-[:checked]:bg-primary-500/10">
              <input
                type="radio"
                name="mover-tab"
                checked={tab === 'position'}
                onChange={() => setTab('position')}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-white block">A la posición #</span>
                <span className="text-xs text-white/55">Número de parada en la lista (1 = primero)</span>
              </span>
            </label>
          </div>

          {(tab === 'before' || tab === 'after') && (
            <div>
              <label htmlFor="mover-ref-cliente" className="block text-sm font-medium text-white mb-2">
                Cliente de referencia
              </label>
              <select
                id="mover-ref-cliente"
                value={refCodigo}
                onChange={(e) => setRefCodigo(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-base"
              >
                <option value="">Elegir…</option>
                {otros.map((c) => (
                  <option key={c.codigoCliente} value={String(c.codigoCliente)} className="bg-[#0f1b2e]">
                    {formatFullName(c.nombre, c.apellido)}
                    {c.direccion ? ` — ${c.direccion}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab === 'position' && (
            <div>
              <label htmlFor="mover-pos" className="block text-sm font-medium text-white mb-2">
                Posición (1 a {clientes.length})
              </label>
              <input
                id="mover-pos"
                type="number"
                inputMode="numeric"
                min={1}
                max={clientes.length}
                value={posStr}
                onChange={(e) => setPosStr(e.target.value)}
                placeholder="Ej: 5"
                className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-lg placeholder-white/40"
              />
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAplicar}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-400 to-primary-600 text-white font-semibold hover:from-primary-500 hover:to-primary-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function RutaRowActionsMenu({
  waUrl,
  onNuevoPedido,
  onEntregar,
  entregarLoading,
}: {
  waUrl: string | null;
  onNuevoPedido: () => void;
  onEntregar: () => void | Promise<void>;
  entregarLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/[0.06] text-white/85 hover:bg-white/10 flex items-center justify-center min-h-[36px] min-w-[36px]"
        title="Acciones"
        aria-label="Abrir menú de acciones"
      >
        <MoreVertical size={18} strokeWidth={2.25} />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-1 z-[80] min-w-[12.5rem] rounded-xl border border-white/15 bg-[#0f1b2e] shadow-2xl py-1 text-sm"
        >
          <li>
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-white hover:bg-white/10"
              onClick={() => {
                setOpen(false);
                onNuevoPedido();
              }}
            >
              <Plus size={16} className="text-emerald-300/95 shrink-0" />
              Nuevo pedido
            </button>
          </li>
          <li>
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-white hover:bg-white/10 disabled:opacity-45 disabled:pointer-events-none"
              disabled={entregarLoading}
              onClick={() => {
                setOpen(false);
                void onEntregar();
              }}
            >
              <Truck size={16} className="text-green-400 shrink-0" />
              {entregarLoading ? 'Cargando…' : 'Entregar pedido'}
            </button>
          </li>
          {waUrl && (
            <li>
              <a
                role="menuitem"
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 text-[#25D366] hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                WhatsApp
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function SortableRow({
  cliente,
  index,
  onMover,
  onNuevoPedido,
  onEntregar,
  entregarLoading,
}: {
  cliente: ClienteConOrden;
  index: number;
  onMover: () => void;
  onNuevoPedido: () => void;
  onEntregar: () => void | Promise<void>;
  entregarLoading: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cliente.codigoCliente });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const waUrl = whatsappHref(cliente.telefono);

  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const wasDraggingRef = useRef(false);
  const suppressClickUntilRef = useRef(0);

  useEffect(() => {
    if (wasDraggingRef.current && !isDragging) {
      suppressClickUntilRef.current = Date.now() + 350;
    }
    wasDraggingRef.current = isDragging;
  }, [isDragging]);

  const dragListeners = listeners as {
    onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
    [key: string]: unknown;
  };
  const { onPointerDown: dndPointerDown, ...restDragListeners } = dragListeners;

  const handleOrdenClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (Date.now() < suppressClickUntilRef.current) return;
    const start = pointerDownRef.current;
    pointerDownRef.current = null;
    if (start) {
      const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (dist >= 8) return;
    }
    onMover();
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl border
        ${isDragging
          ? 'bg-primary-500/30 border-primary-500/60 shadow-lg z-50 opacity-95'
          : 'bg-white/5 border-white/10'
        }
      `}
    >
      {/* Clic = mover con precisión; arrastrar = reordenar (mismo umbral 8px que el sensor) */}
      <button
        type="button"
        className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/[0.06] text-primary-300/95 hover:bg-white/10 touch-none cursor-grab active:cursor-grabbing flex items-center justify-center min-h-[36px] min-w-[40px] flex-shrink-0"
        title="Arrastrá para reordenar · Clic para mover con precisión"
        aria-label="Reordenar arrastrando o abrir mover con precisión al hacer clic"
        {...attributes}
        {...restDragListeners}
        onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
          pointerDownRef.current = { x: e.clientX, y: e.clientY };
          dndPointerDown?.(e);
        }}
        onPointerCancel={() => {
          pointerDownRef.current = null;
        }}
        onClick={handleOrdenClick}
      >
        <ArrowRightLeft size={17} strokeWidth={2.25} />
      </button>

      <span
        className="min-w-[1rem] max-w-[1.5rem] shrink-0 text-center text-[11px] font-bold tabular-nums leading-none text-primary-300/95 pt-0.5"
        title={`Parada ${index + 1}`}
      >
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate text-[15px] leading-snug">
          {formatFullName(cliente.nombre, cliente.apellido)}
        </p>
        {cliente.direccion && (
          <p className="text-xs text-white/60 truncate">{cliente.direccion}</p>
        )}
        <p className="text-[11px] text-white/45 mt-0.5 leading-tight">
          {cliente.pedidosPendientes != null && cliente.pedidosPendientes > 0
            ? `${cliente.pedidosPendientes} pedido${cliente.pedidosPendientes !== 1 ? 's' : ''} pendiente${cliente.pedidosPendientes !== 1 ? 's' : ''}`
            : 'Sin pedidos pendientes'}
        </p>
      </div>

      <RutaRowActionsMenu
        waUrl={waUrl}
        onNuevoPedido={onNuevoPedido}
        onEntregar={onEntregar}
        entregarLoading={entregarLoading}
      />
    </li>
  );
}

function RutaOrdenList({ zona, clientes: initialClientes, onSaved }: RutaOrdenListProps) {
  const [clientes, setClientes] = useState<ClienteConOrden[]>(initialClientes);
  const [isSaving, setIsSaving] = useState(false);
  const [moverCliente, setMoverCliente] = useState<ClienteConOrden | null>(null);
  const [newPedidoOpen, setNewPedidoOpen] = useState(false);
  const [newPedidoClienteCodigo, setNewPedidoClienteCodigo] = useState<number | undefined>(undefined);
  const [entregarPedido, setEntregarPedido] = useState<Pedido | null>(null);
  const [entregarBusyCodigo, setEntregarBusyCodigo] = useState<number | null>(null);

  const setOrdenDirty = useRutasOrdenStore((s) => s.setOrdenDirty);
  const registerSaveOrder = useRutasOrdenStore((s) => s.registerSaveOrder);
  const clientesRef = useRef(clientes);
  clientesRef.current = clientes;

  useEffect(() => {
    setClientes(initialClientes);
  }, [zona, initialClientes]);

  const isDirty = useMemo(
    () => !ordenCodigosIguales(clientes, initialClientes),
    [clientes, initialClientes]
  );

  useEffect(() => {
    setOrdenDirty(isDirty);
  }, [isDirty, setOrdenDirty]);

  const saveOrder = useCallback(async () => {
    setIsSaving(true);
    try {
      const orden = clientesRef.current.map((c) => c.codigoCliente);
      await rutasService.guardarOrden(zona, orden);
      toast.success('Orden de reparto guardado');
      onSaved();
    } catch (error) {
      toast.error('Error guardando el orden');
      console.error(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [zona, onSaved]);

  useEffect(() => {
    if (clientes.length === 0) {
      registerSaveOrder(null);
      return;
    }
    registerSaveOrder(() => saveOrder());
    return () => registerSaveOrder(null);
  }, [clientes.length, saveOrder, registerSaveOrder]);

  useEffect(() => {
    return () => {
      useRutasOrdenStore.getState().setOrdenDirty(false);
      useRutasOrdenStore.getState().registerSaveOrder(null);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) return;
    const oldIndex = clientes.findIndex((c) => c.codigoCliente === active.id);
    const newIndex = clientes.findIndex((c) => c.codigoCliente === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(clientes, oldIndex, newIndex);
    setClientes(reordered.map((c, i) => ({ ...c, orden: i })));
  };

  const handleMoverApply = (modo: MoverTab, refCodigo: number | undefined, positionN: number | undefined) => {
    if (!moverCliente) return;
    const next = reorderClientesRuta(clientes, moverCliente.codigoCliente, modo, refCodigo, positionN);
    setClientes(next);
    toast.success('Orden actualizado (guardá para persistir)');
  };

  const handleEntregarPedido = async (cli: ClienteConOrden) => {
    setEntregarBusyCodigo(cli.codigoCliente);
    try {
      const lista = await pedidosService.getAll(true, undefined, zona);
      const delCliente = lista.filter((p) => pedidoMatchesCliente(p, cli.codigoCliente));
      const pedido = pickPedidoParaEntregar(delCliente);
      if (!pedido) {
        toast.error('No hay pedidos pendientes o en proceso para entregar');
        return;
      }
      setEntregarPedido(pedido);
    } catch (e) {
      console.error(e);
      toast.error('No se pudieron cargar los pedidos');
    } finally {
      setEntregarBusyCodigo(null);
    }
  };

  if (clientes.length === 0) {
    return (
      <div className="p-8 text-center border border-white/10 rounded-xl bg-white/5">
        <p className="text-white/70">No hay clientes en esta zona</p>
        <p className="text-sm text-white/50 mt-1">Los clientes con esta zona asignada aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {moverCliente && (
        <MoverModal
          cliente={moverCliente}
          clientes={clientes}
          onClose={() => setMoverCliente(null)}
          onApply={handleMoverApply}
        />
      )}

      <NewPedidoModal
        isOpen={newPedidoOpen}
        onClose={() => {
          setNewPedidoOpen(false);
          setNewPedidoClienteCodigo(undefined);
        }}
        initialClienteCodigo={newPedidoClienteCodigo}
      />

      <EntregarPedidoModal
        isOpen={entregarPedido !== null}
        pedido={entregarPedido}
        onClose={() => setEntregarPedido(null)}
        onSuccess={(pedidoEntregado) => {
          const codigo = getCodigoClienteDesdePedido(pedidoEntregado);
          if (codigo == null) return;
          setClientes((prev) =>
            prev.map((c) =>
              c.codigoCliente === codigo
                ? {
                    ...c,
                    pedidosPendientes: Math.max(0, (c.pedidosPendientes ?? 0) - 1),
                  }
                : c
            )
          );
        }}
      />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-white/60 max-w-xl">
          <strong className="text-white/80">Clic</strong> en las flechas para mover con precisión;{' '}
          <strong className="text-white/80">arrastrá</strong> las mismas para reordenar. El número es el orden de visita.
        </p>
        <button
          type="button"
          onClick={() => void saveOrder()}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-500 hover:to-primary-600 disabled:opacity-50 shadow-lg shadow-primary-500/30"
        >
          <Save size={18} />
          {isSaving ? 'Guardando...' : 'Guardar orden'}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={clientes.map((c) => c.codigoCliente)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {clientes.map((cliente, index) => (
              <SortableRow
                key={cliente.codigoCliente}
                cliente={cliente}
                index={index}
                onMover={() => setMoverCliente(cliente)}
                onNuevoPedido={() => {
                  setNewPedidoClienteCodigo(cliente.codigoCliente);
                  setNewPedidoOpen(true);
                }}
                onEntregar={() => handleEntregarPedido(cliente)}
                entregarLoading={entregarBusyCodigo === cliente.codigoCliente}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default RutaOrdenList;
