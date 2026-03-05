import { Package, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { InformeResumen } from '../types';

interface ResumenCardsProps {
  informe: InformeResumen;
}

const STAT_CARDS = (informe: InformeResumen) => [
  {
    label: 'Total de Pedidos',
    value: informe.totalPedidos.toString(),
    sub: 'Pedidos entregados',
    icon: <Package size={20} color="#00D1FF" />,
    accent: '#00D1FF',
    accentBg: 'rgba(0,209,255,0.12)',
  },
  {
    label: 'Total de Clientes',
    value: informe.totalClientes.toString(),
    sub: 'Clientes únicos',
    icon: <Users size={20} color="#3B82F6" />,
    accent: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.12)',
  },
  {
    label: 'Total de Ventas',
    value: formatCurrency(informe.totalVentas),
    sub: 'Ingresos totales',
    icon: <DollarSign size={20} color="#22C55E" />,
    accent: '#22C55E',
    accentBg: 'rgba(34,197,94,0.12)',
  },
];

function ResumenCards({ informe }: ResumenCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {STAT_CARDS(informe).map((card) => (
        <div
          key={card.label}
          style={{
            background: '#1E1E1E',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '20px',
          }}
        >
          {/* Icon badge */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: card.accentBg,
              border: `1px solid ${card.accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            {card.icon}
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
            {card.label}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 4px', lineHeight: 1 }}>
            {card.value}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#4B5563', margin: 0 }}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

export default ResumenCards;
