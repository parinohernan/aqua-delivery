import { useState, useEffect } from 'react';
import informesService from '../services/informesService';
import InformesToolbar from './InformesToolbar';
import ResumenCards from './ResumenCards';
import ProductosTable from './ProductosTable';
import ClientesTable from './ClientesTable';
import type { TipoInforme, InformeResumen, InformeDetallado } from '../types';

/**
 * Sección de Informes
 * Componente principal para la generación de informes
 */
function InformesSection() {
  const [tipoInforme, setTipoInforme] = useState<TipoInforme>('resumen');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  
  const [informeResumen, setInformeResumen] = useState<InformeResumen | null>(null);
  const [informeDetallado, setInformeDetallado] = useState<InformeDetallado | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Establecer fechas por defecto al cargar
  useEffect(() => {
    const hasta = new Date();
    const desde = new Date();
    desde.setMonth(desde.getMonth() - 1);
    
    setFechaDesde(desde.toISOString().split('T')[0]);
    setFechaHasta(hasta.toISOString().split('T')[0]);
  }, []);

  const handleGenerarInforme = async () => {
    if (!fechaDesde || !fechaHasta) {
      setError('Debes seleccionar ambas fechas');
      return;
    }

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
      const errorMessage = err instanceof Error ? err.message : 'Error generando informe';
      setError(errorMessage);
      console.error('Error generando informe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportarCSV = () => {
    if (tipoInforme === 'resumen' && informeResumen) {
      // Exportar resumen
      const headers = ['Producto', 'Cantidad', 'Total'];
      const rows = informeResumen.productos.map(p => [
        p.descripcion,
        p.cantidad.toString(),
        p.total.toString(),
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `informe-resumen-${fechaDesde}-${fechaHasta}.csv`;
      link.click();
    } else if (tipoInforme === 'detallado' && informeDetallado) {
      // Exportar detallado
      const headers = ['Cliente', 'Teléfono', 'Total Pedidos', 'Total Comprado'];
      const rows = informeDetallado.clientes.map(c => [
        `${c.nombre} ${c.apellido}`,
        c.telefono || '',
        c.totalPedidos.toString(),
        c.totalComprado.toString(),
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `informe-detallado-${fechaDesde}-${fechaHasta}.csv`;
      link.click();
    }
  };

  return (
    <div className="bg-[#0f1b2e]/70 backdrop-blur-sm rounded-xl shadow-lg shadow-black/30 p-4 sm:p-6 border border-white/10 text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span>
          Informes y Reportes
        </h2>
        <p className="text-white/80 mt-1">
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
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Informe Resumen */}
      {informeResumen && tipoInforme === 'resumen' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-xl font-bold text-white">
              Informe de Resumen
            </h3>
            <button
              onClick={handleExportarCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30"
            >
              📥 Exportar CSV
            </button>
          </div>

          <ResumenCards informe={informeResumen} />
          <ProductosTable productos={informeResumen.productos} />
        </div>
      )}

      {/* Informe Detallado */}
      {informeDetallado && tipoInforme === 'detallado' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-xl font-bold text-white">
              Informe Detallado por Cliente
            </h3>
            <button
              onClick={handleExportarCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30"
            >
              📥 Exportar CSV
            </button>
          </div>

          <ClientesTable clientes={informeDetallado.clientes} />
        </div>
      )}

      {/* Estado inicial */}
      {!informeResumen && !informeDetallado && !isLoading && (
        <div className="text-center py-12 text-white/70">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">Selecciona las fechas y genera un informe</p>
          <p className="text-sm mt-2">Los informes muestran datos de pedidos entregados en el rango seleccionado</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
          <p className="text-white/70 text-lg mb-2">Generando informe...</p>
          <p className="text-white/50 text-sm">
            {tipoInforme === 'detallado' 
              ? 'Procesando datos de clientes (esto puede tardar unos segundos)...'
              : 'Obteniendo estadísticas...'}
          </p>
        </div>
      )}
    </div>
  );
}

export default InformesSection;
