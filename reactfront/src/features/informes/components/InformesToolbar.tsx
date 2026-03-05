import type { TipoInforme } from '../types';
import { BarChart2, ClipboardList, Play, CalendarDays } from 'lucide-react';

interface InformesToolbarProps {
  tipoInforme: TipoInforme;
  fechaDesde: string;
  fechaHasta: string;
  onTipoChange: (tipo: TipoInforme) => void;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
  onGenerar: () => void;
  isLoading: boolean;
}

function InformesToolbar({
  tipoInforme, fechaDesde, fechaHasta,
  onTipoChange, onFechaDesdeChange, onFechaHastaChange,
  onGenerar, isLoading,
}: InformesToolbarProps) {
  const getDefaultFechaDesde = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0]; };
  const getDefaultFechaHasta = () => new Date().toISOString().split('T')[0];

  const handleRangoRapido = (dias: number) => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    onFechaDesdeChange(desde.toISOString().split('T')[0]);
    onFechaHastaChange(hasta.toISOString().split('T')[0]);
  };

  const cardStyle: React.CSSProperties = {
    background: '#1E1E1E',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 14px',
    background: '#2A2A2A',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#E2E8F0',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#94A3B8',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px',
  };

  const tabActive: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#00D1FF',
    color: '#0B0E11',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: 'inherit',
  };

  const tabInactive: React.CSSProperties = {
    ...tabActive,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94A3B8',
    fontWeight: 500,
  };

  const rangoStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#94A3B8',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 200ms ease, color 200ms ease',
  };

  return (
    <div style={cardStyle}>
      {/* Tipo de informe */}
      <div>
        <label style={labelStyle}>Tipo de Informe</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => onTipoChange('resumen')} style={tipoInforme === 'resumen' ? tabActive : tabInactive}>
            <BarChart2 size={15} />
            Resumen
          </button>
          <button onClick={() => onTipoChange('detallado')} style={tipoInforme === 'detallado' ? tabActive : tabInactive}>
            <ClipboardList size={15} />
            Detallado por Cliente
          </button>
        </div>
      </div>

      {/* Fechas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div>
          <label style={labelStyle}>
            <CalendarDays size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Fecha Desde
          </label>
          <input
            type="date"
            value={fechaDesde || getDefaultFechaDesde()}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            max={fechaHasta || getDefaultFechaHasta()}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            <CalendarDays size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Fecha Hasta
          </label>
          <input
            type="date"
            value={fechaHasta || getDefaultFechaHasta()}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            min={fechaDesde || getDefaultFechaDesde()}
            max={getDefaultFechaHasta()}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Rangos rápidos */}
      <div>
        <label style={labelStyle}>Rangos Rápidos</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[{ label: '7 días', dias: 7 }, { label: '1 mes', dias: 30 }, { label: '3 meses', dias: 90 }, { label: '1 año', dias: 365 }].map(({ label, dias }) => (
            <button
              key={dias}
              type="button"
              onClick={() => handleRangoRapido(dias)}
              style={rangoStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#E2E8F0'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Generar */}
      <div>
        <button
          onClick={onGenerar}
          disabled={isLoading || !fechaDesde || !fechaHasta}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '10px',
            border: 'none',
            background: isLoading || !fechaDesde || !fechaHasta ? '#2A2A2A' : '#00D1FF',
            color: isLoading || !fechaDesde || !fechaHasta ? '#4B5563' : '#0B0E11',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: isLoading || !fechaDesde || !fechaHasta ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'box-shadow 250ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 1px #00D1FF, 0 0 16px rgba(0,209,255,0.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <Play size={15} />
          {isLoading ? 'Generando...' : 'Generar Informe'}
        </button>
      </div>
    </div>
  );
}

export default InformesToolbar;
