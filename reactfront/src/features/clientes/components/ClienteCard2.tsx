import { useState } from 'react';
import { formatCurrency, formatFullName } from '@/utils/formatters';
import ClienteModal from './ClienteModal';
import ClientPaymentModal from './ClientPaymentModal';
import ClienteAlquileresModal from './ClienteAlquileresModal';
import type { Cliente } from '@/types/entities';

/**
 * ClienteCard2 - Versión minimalista para móvil.
 * Sin SVG/iconos (causan ruido en Android Chrome). Sin flex gap ni efectos.
 */
interface ClienteCard2Props {
  cliente: Cliente;
}

function ClienteCard2({ cliente }: ClienteCard2Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAlquileresModal, setShowAlquileresModal] = useState(false);

  const nombreCompleto = formatFullName(cliente.nombre, cliente.apellido);
  const saldo = cliente.saldo || 0;
  const retornables = cliente.retornables || 0;
  const saldoPositive = saldo > 0;
  const saldoNegative = saldo < 0;
  const saldoColor = saldoPositive ? '#EF4444' : saldoNegative ? '#22C55E' : '#94A3B8';
  const saldoLabel = saldoPositive ? 'DEBE' : saldoNegative ? 'A FAVOR' : 'AL DÍA';

  const btnBase = {
    padding: '10px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit' as const,
    border: 'none',
  };

  return (
    <>
      <div
        style={{
          background: '#1E1E1E',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#F1F5F9', margin: '0 0 6px 0' }}>
          {nombreCompleto}
        </p>
        <p style={{ fontSize: '0.75rem', color: saldoColor, margin: '0 0 6px 0' }}>
          {saldoLabel} · {formatCurrency(Math.abs(saldo))}
        </p>
        {cliente.telefono && (
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 6px 0' }}>
            {cliente.telefono}
          </p>
        )}
        {retornables > 0 && (
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 6px 0' }}>
            {retornables} retornable{retornables !== 1 ? 's' : ''}
          </p>
        )}
        {retornables < 0 && (
          <p style={{ fontSize: '0.82rem', color: '#22C55E', fontWeight: 500, margin: '0 0 12px 0' }}>
            {Math.abs(retornables)} envase{Math.abs(retornables) !== 1 ? 's' : ''} a favor
          </p>
        )}

        <div style={{ marginTop: 12, display: 'flex' }}>
          <button
            onClick={() => setShowPaymentModal(true)}
            style={{ ...btnBase, flex: 1, background: '#22C55E', color: '#fff', marginRight: 8 }}
          >
            Cobrar
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            style={{ ...btnBase, flex: 1, background: 'transparent', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.12)', marginRight: 8 }}
          >
            Editar
          </button>
          <button
            onClick={() => setShowAlquileresModal(true)}
            style={{ ...btnBase, flex: 1, background: '#1D4ED8', color: '#fff' }}
          >
            Alquileres
          </button>
        </div>
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
      <ClienteAlquileresModal
        isOpen={showAlquileresModal}
        cliente={cliente}
        onClose={() => setShowAlquileresModal(false)}
      />
    </>
  );
}

export default ClienteCard2;
