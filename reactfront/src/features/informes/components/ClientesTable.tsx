import { Users, ShoppingBag, DollarSign, ChevronRight } from 'lucide-react';
import { formatCurrency, formatFullName } from '@/utils/formatters';
import { useState } from 'react';
import ClienteDetalleModal from './ClienteDetalleModal';
import type { ClienteDetallado } from '../types';

interface ClientesTableProps {
  clientes: ClienteDetallado[];
}

function ClientesTable({ clientes }: ClientesTableProps) {
  const [selectedCliente, setSelectedCliente] = useState<ClienteDetallado | null>(null);
  const isTouchDevice = 'ontouchstart' in window;

  if (clientes.length === 0) {
    return (
      <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#94A3B8', margin: 0 }}>No hay clientes para mostrar</p>
      </div>
    );
  }

  return (
    <>
      <div className="informes-table-mobile-safe" style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={16} color="#00D1FF" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Informe por Cliente</h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
              {clientes.length} {clientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </p>
          </div>
        </div>

        {/* Rows */}
        <div>
          {clientes.map((cliente) => {
            const nombreCompleto = formatFullName(cliente.nombre, cliente.apellido);
            const initials = cliente.nombre.charAt(0).toUpperCase() + (cliente.apellido?.charAt(0).toUpperCase() || '');

            return (
              <div
                key={cliente.codigo}
                className="informe-cliente-row"
                onClick={() => setSelectedCliente(cliente)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: isTouchDevice ? 'none' : 'background 150ms ease',
                }}
                onMouseEnter={!isTouchDevice ? (e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; } : undefined}
                onMouseLeave={!isTouchDevice ? (e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; } : undefined}
              >
                {/* Fila 1: Avatar + Nombre + Chevron */}
                <div className="informe-cliente-row-top">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(0,209,255,0.12)',
                      border: '1px solid rgba(0,209,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#00D1FF',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F1F5F9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {nombreCompleto}
                    </p>
                  </div>
                  <ChevronRight size={16} color="#4B5563" style={{ flexShrink: 0 }} />
                </div>
                {/* Fila 2: Stats (en móvil se muestra debajo) */}
                <div className="informe-cliente-row-stats">
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.7rem', color: '#94A3B8', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <ShoppingBag size={10} /> Pedidos
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>{cliente.totalPedidos}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.7rem', color: '#94A3B8', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <DollarSign size={10} /> Total
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22C55E', margin: 0 }}>{formatCurrency(cliente.totalComprado)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ClienteDetalleModal
        isOpen={selectedCliente !== null}
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </>
  );
}

export default ClientesTable;
