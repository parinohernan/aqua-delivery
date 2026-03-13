import { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Map,
  Clock,
  CalendarCheck,
  Plus,
} from 'lucide-react';
import { usePedidosStore } from '../stores/pedidosStore';
import { pedidosService } from '../services/pedidosService';
import { formatCurrency, formatDateTimeShort } from '@/utils/formatters';
import { toast, confirm } from '@/utils/feedback';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import EntregarPedidoModal from './EntregarPedidoModal';
import ProgramarEntregaModal from './ProgramarEntregaModal';
import type { Pedido } from '@/types/entities';

interface Zona {
  id: number;
  zona: string;
}

interface PedidoCardProps {
  pedido: Pedido;
}

// ─── Estado config ────────────────────────────────────────────────────────────
type EstadoKey = 'pendient' | 'proceso' | 'entregad' | 'anulado';

const ESTADO_CONFIG: Record<EstadoKey, { label: string; color: string; bg: string }> = {
  pendient: {
    label: 'PENDIENTE',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  proceso: {
    label: 'EN PROCESO',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
  },
  entregad: {
    label: 'ENTREGADO',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
  },
  anulado: {
    label: 'ANULADO',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
  },
};

function getEstadoConfig(estado: string) {
  return (
    ESTADO_CONFIG[estado as EstadoKey] ?? {
      label: estado.toUpperCase(),
      color: '#94A3B8',
      bg: 'rgba(148,163,184,0.12)',
    }
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────
function PedidoCard({ pedido }: PedidoCardProps) {
  const { updateStatus, loadPedidos } = usePedidosStore();
  const [showEntregarModal, setShowEntregarModal] = useState(false);
  const [showProgramarModal, setShowProgramarModal] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // Estado para zona (select nativo = más rápido y simple en móvil)
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [nuevaZona, setNuevaZona] = useState('');
  const [showNuevaZonaInput, setShowNuevaZonaInput] = useState(false);
  const [isUpdatingZona, setIsUpdatingZona] = useState(false);

  const id = pedido.codigo || pedido.id;
  const nombreCliente =
    pedido.cliente_nombre ||
    (pedido.cliente
      ? `${pedido.cliente.nombre || ''} ${pedido.cliente.apellido || ''}`.trim()
      : 'Cliente sin nombre');
  const direccion = pedido.direccion || null;
  const zonaActual = pedido.zona || null;
  const total = pedido.total || 0;
  const estado = pedido.estado || 'pendient';
  const estadoCfg = getEstadoConfig(estado);
  
  // Fechas
  const fechaPedido = pedido.fecha_pedido || pedido.fecha;
  const fechaProgramada = pedido.fecha_programada;
  const fechaEntrega = pedido.fecha_entrega;

  const isActive = estado === 'pendient' || estado === 'proceso';

  // Cargar zonas al montar para que el select tenga opciones listas (mejor en móvil)
  useEffect(() => {
    let cancelled = false;
    apiClient.get<Zona[]>(endpoints.zonas()).then((data) => {
      if (!cancelled) setZonas(data);
    }).catch((err) => { if (!cancelled) console.error(err); });
    return () => { cancelled = true; };
  }, []);

  const handleZonaChange = async (zona: string) => {
    setIsUpdatingZona(true);
    try {
      await pedidosService.updateZona(Number(id), zona);
      await loadPedidos();
      toast.success(`Zona actualizada a "${zona}"`);
    } catch (error) {
      toast.error('Error actualizando zona');
    } finally {
      setIsUpdatingZona(false);
    }
  };

  const handleCrearZona = async () => {
    if (!nuevaZona.trim()) return;
    setIsUpdatingZona(true);
    try {
      await apiClient.post(endpoints.zonas(), { zona: nuevaZona.trim() });
      await pedidosService.updateZona(Number(id), nuevaZona.trim());
      const data = await apiClient.get<Zona[]>(endpoints.zonas());
      setZonas(data);
      await loadPedidos();
      toast.success(`Zona "${nuevaZona}" creada y asignada`);
      setNuevaZona('');
      setShowNuevaZonaInput(false);
    } catch (error) {
      toast.error('Error creando zona');
    } finally {
      setIsUpdatingZona(false);
    }
  };

  const handleCancelar = async () => {
    const ok = await confirm({
      title: 'Cancelar pedido',
      message: '¿Estás seguro de que quieres cancelar este pedido?',
      confirmLabel: 'Cancelar pedido',
      cancelLabel: 'Volver',
      variant: 'danger',
    });
    if (ok) {
      try {
        await updateStatus(pedido.id, 'anulado');
        toast.success('Pedido cancelado');
      } catch {
        toast.error('Error cancelando pedido');
      }
    }
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#1E1E1E',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          transition: 'transform 250ms ease, box-shadow 250ms ease',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 8px 24px rgba(0,0,0,0.45)'
            : '0 2px 8px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.35s ease-out',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          {/* Nombre del cliente — protagonista */}
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#F1F5F9',
              lineHeight: 1.3,
              flex: 1,
              margin: 0,
            }}
          >
            {nombreCliente}
          </h3>

          {/* Número de pedido — marca de agua */}
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 500,
              color: '#4B5563',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              paddingTop: '2px',
            }}
          >
            #{id}
          </span>
        </div>

        {/* ── Badge de estado ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: estadoCfg.color,
              background: estadoCfg.bg,
              border: `1px solid ${estadoCfg.color}40`,
            }}
          >
            {estadoCfg.label}
          </span>
        </div>

        {/* ── Info ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Fecha del pedido */}
          {fechaPedido && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} color="#94A3B8" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                {formatDateTimeShort(fechaPedido)}
              </span>
            </div>
          )}
          
          {/* Fecha programada o botón para programar */}
          {estado === 'entregad' && fechaEntrega ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarCheck size={14} color="#22C55E" />
              <span style={{ fontSize: '0.82rem', color: '#22C55E' }}>
                Entregado: {formatDateTimeShort(fechaEntrega)}
              </span>
            </div>
          ) : fechaProgramada ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#3B82F6" />
              <span style={{ fontSize: '0.82rem', color: '#3B82F6' }}>
                Programado: {formatDateTimeShort(fechaProgramada)}
              </span>
              {isActive && (
                <button
                  onClick={() => setShowProgramarModal(true)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    background: 'rgba(59,130,246,0.2)',
                    border: '1px solid rgba(59,130,246,0.4)',
                    borderRadius: '4px',
                    color: '#3B82F6',
                    cursor: 'pointer',
                  }}
                >
                  Cambiar
                </button>
              )}
            </div>
          ) : isActive ? (
            <button
              onClick={() => setShowProgramarModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                fontSize: '0.78rem',
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '8px',
                color: '#60A5FA',
                cursor: 'pointer',
                fontFamily: 'inherit',
                width: 'fit-content',
              }}
            >
              <Clock size={14} />
              Programar entrega
            </button>
          ) : null}
          
          {/* Zona: select nativo (rápido y simple en móvil) + botón agregar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Map size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
            {isActive ? (
              <>
                <select
                  value={zonaActual || ''}
                  onChange={(e) => handleZonaChange(e.target.value || '')}
                  disabled={isUpdatingZona}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    color: '#E2E8F0',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#1a1a2e' }}>Sin zona</option>
                  {zonas.map((z) => (
                    <option key={z.id} value={z.zona} style={{ background: '#1a1a2e' }}>
                      {z.zona}
                    </option>
                  ))}
                  {zonaActual && !zonas.some((z) => z.zona === zonaActual) && (
                    <option value={zonaActual} style={{ background: '#1a1a2e' }}>{zonaActual}</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNuevaZonaInput((s) => !s)}
                  style={{
                    padding: '6px 8px',
                    background: 'transparent',
                    border: '1px solid rgba(96,165,250,0.5)',
                    borderRadius: '8px',
                    color: '#60A5FA',
                    cursor: 'pointer',
                  }}
                  title="Agregar zona"
                >
                  <Plus size={16} />
                </button>
                {showNuevaZonaInput && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={nuevaZona}
                      onChange={(e) => setNuevaZona(e.target.value)}
                      placeholder="Nombre de zona"
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        fontSize: '0.82rem',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCrearZona();
                        if (e.key === 'Escape') setShowNuevaZonaInput(false);
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCrearZona}
                      disabled={!nuevaZona.trim() || isUpdatingZona}
                      style={{
                        padding: '6px 12px',
                        background: '#22C55E',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNuevaZonaInput(false); setNuevaZona(''); }}
                      style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#94A3B8',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </>
            ) : (
              <span style={{ fontSize: '0.82rem', color: zonaActual ? '#94A3B8' : '#6B7280' }}>
                {zonaActual || 'Sin zona'}
              </span>
            )}
          </div>
          
          {direccion && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={14} color="#94A3B8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>
                {direccion}
              </span>
            </div>
          )}
          {pedido.items && pedido.items.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={14} color="#94A3B8" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                {pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ── Total ───────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>TOTAL</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9' }}>
            {formatCurrency(total)}
          </span>
        </div>

        {/* ── Acciones ────────────────────────────────────────────────────── */}
        {isActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Botón Entregar — protagonista con glow */}
            <button
              onClick={() => setShowEntregarModal(true)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#22C55E',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'box-shadow 250ms ease, background 250ms ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 0 1px #22C55E, 0 0 16px rgba(34,197,94,0.45)';
                (e.currentTarget as HTMLButtonElement).style.background = '#16A34A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.background = '#22C55E';
              }}
            >
              <Truck size={16} />
              Entregar
            </button>

            {/* Botón Cancelar — outline discreto, solo para pendient */}
            {estado === 'pendient' && (
              <button
                onClick={handleCancelar}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239,68,68,0.4)',
                  background: 'transparent',
                  color: '#EF4444',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 200ms ease, border-color 200ms ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(239,68,68,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'rgba(239,68,68,0.7)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'rgba(239,68,68,0.4)';
                }}
              >
                <XCircle size={15} />
                Cancelar
              </button>
            )}
          </div>
        )}

        {/* ── Estados finales — solo lectura ──────────────────────────────── */}
        {!isActive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              background: estadoCfg.bg,
              border: `1px solid ${estadoCfg.color}30`,
              color: estadoCfg.color,
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            {estado === 'entregad' ? (
              <CheckCircle size={15} />
            ) : (
              <XCircle size={15} />
            )}
            {estadoCfg.label}
          </div>
        )}
      </div>

      {/* Modal de Entrega */}
      <EntregarPedidoModal
        isOpen={showEntregarModal}
        pedido={pedido}
        onClose={() => setShowEntregarModal(false)}
      />
      
      {/* Modal de Programar */}
      <ProgramarEntregaModal
        isOpen={showProgramarModal}
        pedido={pedido}
        onClose={() => setShowProgramarModal(false)}
      />
    </>
  );
}

export default PedidoCard;
