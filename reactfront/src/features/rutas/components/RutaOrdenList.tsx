import { useState, useEffect } from 'react';
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
import { GripVertical, Save } from 'lucide-react';
import { formatFullName } from '@/utils/formatters';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Normaliza teléfono para enlace WhatsApp: solo dígitos (wa.me/5491112345678) */
function whatsappHref(telefono: string | undefined): string | null {
  if (!telefono || !telefono.trim()) return null;
  const digits = telefono.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}
import { toast } from '@/utils/feedback';
import { rutasService } from '../services/rutasService';
import type { ClienteConOrden } from '@/types/entities';

interface RutaOrdenListProps {
  zona: string;
  clientes: ClienteConOrden[];
  onSaved: () => void;
}

function SortableRow({
  cliente,
  index,
}: {
  cliente: ClienteConOrden;
  index: number;
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 rounded-xl border
        ${isDragging
          ? 'bg-primary-500/30 border-primary-500/60 shadow-lg z-50 opacity-95'
          : 'bg-white/5 border-white/10'
        }
      `}
    >
      <button
        type="button"
        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 touch-none cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={20} />
      </button>
      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500/30 text-primary-300 font-bold text-sm flex-shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {formatFullName(cliente.nombre, cliente.apellido)}
        </p>
        {cliente.direccion && (
          <p className="text-sm text-white/60 truncate">{cliente.direccion}</p>
        )}
        <p className="text-xs text-white/50 mt-0.5">
          {cliente.pedidosPendientes != null && cliente.pedidosPendientes > 0
            ? `${cliente.pedidosPendientes} pedido${cliente.pedidosPendientes !== 1 ? 's' : ''} pendiente${cliente.pedidosPendientes !== 1 ? 's' : ''}`
            : 'Sin pedidos pendientes'}
        </p>
      </div>
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2.5 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
          title="Enviar mensaje por WhatsApp"
          aria-label="Abrir WhatsApp para enviar mensaje"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </a>
      )}
    </li>
  );
}

function RutaOrdenList({ zona, clientes: initialClientes, onSaved }: RutaOrdenListProps) {
  const [clientes, setClientes] = useState<ClienteConOrden[]>(initialClientes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setClientes(initialClientes);
  }, [zona, initialClientes]);

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

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      const orden = clientes.map((c) => c.codigoCliente);
      await rutasService.guardarOrden(zona, orden);
      toast.success('Orden de reparto guardado');
      onSaved();
    } catch (error) {
      toast.error('Error guardando el orden');
      console.error(error);
    } finally {
      setIsSaving(false);
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-white/60">
          Arrastrá cada fila para cambiar el orden. El número indica la parada en la ruta.
        </p>
        <button
          onClick={handleGuardar}
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
              <SortableRow key={cliente.codigoCliente} cliente={cliente} index={index} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default RutaOrdenList;
