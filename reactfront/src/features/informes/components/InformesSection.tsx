import { useState, useEffect } from 'react';
import { BarChart2, Download, ChartLine } from 'lucide-react';
import informesService from '../services/informesService';
import InformesToolbar from './InformesToolbar';
import ResumenCards from './ResumenCards';
import ProductosTable from './ProductosTable';
import ClientesTable from './ClientesTable';
import type { TipoInforme, InformeResumen, InformeDetallado } from '../types';

function InformesSection() {
  const [tipoInforme, setTipoInforme] = useState<TipoInforme>('resumen');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [informeResumen, setInformeResumen] = useState<InformeResumen | null>(null);
  const [informeDetallado, setInformeDetallado] = useState<InformeDetallado | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasta = new Date();
    const desde = new Date();
    desde.setMonth(desde.getMonth() - 1);
    setFechaDesde(desde.toISOString().split('T')[0]);
    setFechaHasta(hasta.toISOString().split('T')[0]);
  }, []);

  const handleGenerarInforme = async () => {
    if (!fechaDesde || !fechaHasta) { setError('Debes seleccionar ambas fechas'); return; }
    setIsLoading(true);
    setError(null);
    try {
      if (tipoInforme === 'resumen') {
        const resumen = await informesService.getResumenVentas(fechaDesde, fechaHasta);
        setInformeResumen(resumen);
        setInformeDetallado(null);
      } else {
        const detallado = await informesService.getDetalladoClientes(fechaDesde, fechaHasta);
        setInformeDetallado(detallado);
        setInformeResumen(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando informe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportarCSV = () => {
    if (tipoInforme === 'resumen' && informeResumen) {
      const headers = ['Producto', 'Cantidad', 'Total'];
      const rows = informeResumen.productos.map(p => [p.descripcion, p.cantidad.toString(), p.total.toString()]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `informe-resumen-${fechaDesde}-${fechaHasta}.csv`;
      link.click();
    } else if (tipoInforme === 'detallado' && informeDetallado) {
      const headers = ['Cliente', 'Teléfono', 'Total Pedidos', 'Total Comprado'];
      const rows = informeDetallado.clientes.map(c => [
        `${c.nombre} ${c.apellido}`, c.telefono || '', c.totalPedidos.toString(), c.totalComprado.toString(),
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `informe-detallado-${fechaDesde}-${fechaHasta}.csv`;
      link.click();
    }
  };

  const sectionStyle: React.CSSProperties = {
    background: '#161B22',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '24px',
  };

  return (
    <div style={sectionStyle}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <BarChart2 size={22} color="#00D1FF" />
          Informes y Reportes
        </h2>
        <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.875rem' }}>
          Genera informes detallados de ventas y rendimiento
        </p>
      </div>

      <InformesToolbar
        tipoInforme={tipoInforme}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onTipoChange={setTipoInforme}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
        onGenerar={handleGenerarInforme}
        isLoading={isLoading}
      />

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Informe Resumen */}
      {informeResumen && tipoInforme === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
              Informe de Resumen
            </h3>
            <button
              onClick={handleExportarCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#22C55E', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'box-shadow 250ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 1px #22C55E, 0 0 14px rgba(34,197,94,0.4)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            >
              <Download size={15} />
              Exportar CSV
            </button>
          </div>
          <ResumenCards informe={informeResumen} />
          <ProductosTable productos={informeResumen.productos} />
        </div>
      )}

      {/* Informe Detallado */}
      {informeDetallado && tipoInforme === 'detallado' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
              Informe Detallado por Cliente
            </h3>
            <button
              onClick={handleExportarCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#22C55E', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'box-shadow 250ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 1px #22C55E, 0 0 14px rgba(34,197,94,0.4)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            >
              <Download size={15} />
              Exportar CSV
            </button>
          </div>
          <ClientesTable clientes={informeDetallado.clientes} />
        </div>
      )}

      {/* Estado inicial */}
      {!informeResumen && !informeDetallado && !isLoading && (
        <div style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <ChartLine size={48} color="#4B5563" />
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>Selecciona las fechas y genera un informe</p>
          <p style={{ color: '#4B5563', fontSize: '0.825rem', margin: 0 }}>Los informes muestran datos de pedidos entregados en el rango seleccionado</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.2)', borderTopColor: '#00D1FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>Generando informe...</p>
          <p style={{ color: '#4B5563', fontSize: '0.825rem', margin: 0 }}>
            {tipoInforme === 'detallado' ? 'Procesando datos de clientes...' : 'Obteniendo estadísticas...'}
          </p>
        </div>
      )}
    </div>
  );
}

export default InformesSection;
