import { useState } from 'react';
import {
  Phone,
  // CreditCard, Pencil, Trash2 — comentados con los botones
  RotateCcw,
  DollarSign,
  User,
} from 'lucide-react';
import { useClientesStore } from '../stores/clientesStore';
import { formatCurrency, formatFullName } from '@/utils/formatters';
import ClienteModal from './ClienteModal';
import ClientPaymentModal from './ClientPaymentModal';
import type { Cliente } from '@/types/entities';

interface ClienteCardProps {
  cliente: Cliente;
}

function ClienteCard({ cliente }: ClienteCardProps) {
  const { deleteCliente: _deleteCliente } = useClientesStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isTouchDevice] = useState(() => 'ontouchstart' in window);

  const nombreCompleto = formatFullName(cliente.nombre, cliente.apellido);
  const saldo = cliente.saldo || 0;
  const retornables = cliente.retornables || 0;

  // Saldo config
  const saldoPositive = saldo > 0; // cliente debe plata
  const saldoNegative = saldo < 0; // empresa debe al cliente
  const saldoColor = saldoPositive ? '#EF4444' : saldoNegative ? '#22C55E' : '#94A3B8';
  const saldoBg = saldoPositive ? 'rgba(239,68,68,0.12)' : saldoNegative ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.08)';
  const saldoBorder = saldoPositive ? 'rgba(239,68,68,0.35)' : saldoNegative ? 'rgba(34,197,94,0.35)' : 'rgba(148,163,184,0.2)';
  const saldoLabel = saldoPositive ? 'DEBE' : saldoNegative ? 'A FAVOR' : 'AL DÍA';

  // handleDelete comentado con los botones
  // const handleDelete = async () => {
  //   if (confirm('¿Estás seguro de eliminar este cliente?')) {
  //     try { await deleteCliente(cliente.id); } catch { alert('Error eliminando cliente'); }
  //   }
  // };

  return (
    <>
      <div
        onMouseEnter={() => !isTouchDevice && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#1E1E1E',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: isTouchDevice ? 0 : '16px',
          // En móvil: modo minimalista sin efectos para evitar ruido/glitches en Android Chrome
          ...(isTouchDevice
            ? { boxShadow: 'none', transition: 'none' }
            : {
                transition: 'transform 250ms ease, box-shadow 250ms ease',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.3)',
              }),
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', ...(isTouchDevice && { marginBottom: '16px' }) }}>
          {/* Avatar */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(0,209,255,0.12)',
              border: '1px solid rgba(0,209,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={20} color="#00D1FF" />
          </div>

          {/* Nombre + badge */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#F1F5F9',
                margin: 0,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {nombreCompleto}
            </h3>
            {/* Badge de saldo */}
            <span
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: saldoColor,
                background: saldoBg,
                border: `1px solid ${saldoBorder}`,
              }}
            >
              {saldoLabel}
            </span>
          </div>
        </div>

        {/* ── Info ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...(isTouchDevice && { marginBottom: '16px' }) }}>
          {cliente.telefono && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} color="#94A3B8" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{cliente.telefono}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={14} color="#94A3B8" />
            <span style={{ fontSize: '0.82rem', color: saldoColor, fontWeight: 500 }}>
              {formatCurrency(Math.abs(saldo))}
              {saldoPositive ? ' a cobrar' : saldoNegative ? ' a favor' : ''}
            </span>
          </div>
          {retornables > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={14} color="#94A3B8" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                {retornables} retornable{retornables !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ── Acciones ───────────────────────────────────────────── */}
        {/* TEST: botones comentados para descartar si causan el ruido en móvil */}
        {/* <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowPaymentModal(true)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#22C55E', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: isTouchDevice ? 'none' : 'box-shadow 250ms ease, background 250ms ease', fontFamily: 'inherit' }} onMouseEnter={!isTouchDevice ? (e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.boxShadow = '0 0 0 1px #22C55E, 0 0 14px rgba(34,197,94,0.4)'; btn.style.background = '#16A34A'; } : undefined} onMouseLeave={!isTouchDevice ? (e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.boxShadow = 'none'; btn.style.background = '#22C55E'; } : undefined}><CreditCard size={15} />Cobrar</button>
          <button onClick={() => setShowEditModal(true)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#E2E8F0', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: isTouchDevice ? 'none' : 'background 200ms ease, border-color 200ms ease', fontFamily: 'inherit' }} onMouseEnter={!isTouchDevice ? (e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.background = 'rgba(255,255,255,0.07)'; btn.style.borderColor = 'rgba(255,255,255,0.22)'; } : undefined} onMouseLeave={!isTouchDevice ? (e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.background = 'transparent'; btn.style.borderColor = 'rgba(255,255,255,0.12)'; } : undefined}><Pencil size={14} />Editar</button>
          <button onClick={handleDelete} title="Eliminar cliente" style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: isTouchDevice ? 'none' : 'background 200ms ease', fontFamily: 'inherit' }} onMouseEnter={!isTouchDevice ? (e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; } : undefined} onMouseLeave={!isTouchDevice ? (e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } : undefined}><Trash2 size={15} /></button>
        </div> */}
      </div>

      <ClienteModal
        isOpen={showEditModal}
        cliente={cliente}
        onClose={() => setShowEditModal(false)}
      />

      <ClientPaymentModal
        isOpen={showPaymentModal}
        cliente={cliente}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  );
}

export default ClienteCard;
