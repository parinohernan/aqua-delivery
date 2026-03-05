import { useState } from 'react';
import {
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import { usePedidosStore } from '../stores/pedidosStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import EntregarPedidoModal from './EntregarPedidoModal';
import type { Pedido } from '@/types/entities';

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
  const { updateStatus } = usePedidosStore();
  const [showEntregarModal, setShowEntregarModal] = useState(false);
  const [hovered, setHovered] = useState(false);

  const id = pedido.codigo || pedido.id;
  const nombreCliente =
    pedido.cliente_nombre ||
    (pedido.cliente
      ? `${pedido.cliente.nombre || ''} ${pedido.cliente.apellido || ''}`.trim()
      : 'Cliente sin nombre');
  const direccion = pedido.direccion || null;
  const total = pedido.total || 0;
  const estado = pedido.estado || 'pendient';
  const estadoCfg = getEstadoConfig(estado);

  const isActive = estado === 'pendient' || estado === 'proceso';

  const handleCancelar = async () => {
    if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
      try {
        await updateStatus(pedido.id, 'anulado');
      } catch {
        alert('Error cancelando pedido');
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
          {direccion && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={14} color="#94A3B8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>
                {direccion}
              </span>
            </div>
          )}
          {pedido.fecha && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} color="#94A3B8" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                {formatDate(pedido.fecha)}
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
    </>
  );
}

export default PedidoCard;
