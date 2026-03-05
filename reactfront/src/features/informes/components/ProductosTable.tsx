import { Trophy } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { ProductoInforme } from '../types';

interface ProductosTableProps {
  productos: ProductoInforme[];
}

function ProductosTable({ productos }: ProductosTableProps) {
  if (productos.length === 0) {
    return (
      <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#94A3B8', margin: 0 }}>No hay productos para mostrar</p>
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#94A3B8',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textAlign: 'left',
  };

  return (
    <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Trophy size={16} color="#F59E0B" />
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Productos Más Vendidos</h3>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>Top {productos.length} por cantidad vendida</p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <th style={{ ...thStyle, width: '40px' }}>#</th>
              <th style={thStyle}>Producto</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cantidad</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => (
              <tr
                key={index}
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
              >
                <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#4B5563', fontWeight: 600 }}>
                  {index + 1 <= 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#F1F5F9', fontWeight: 500 }}>
                  {producto.descripcion}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#94A3B8', textAlign: 'right' }}>
                  {producto.cantidad}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#22C55E', fontWeight: 700, textAlign: 'right' }}>
                  {formatCurrency(producto.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductosTable;
