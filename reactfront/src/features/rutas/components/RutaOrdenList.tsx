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
