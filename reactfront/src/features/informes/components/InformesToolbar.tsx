import { useState } from 'react';
import type { TipoInforme } from '../types';

/**
 * Barra de herramientas de informes
 * Contiene selector de tipo de informe y fechas
 */
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
  tipoInforme,
  fechaDesde,
  fechaHasta,
  onTipoChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onGenerar,
  isLoading,
}: InformesToolbarProps) {
  // Establecer fechas por defecto (último mes)
  const getDefaultFechaDesde = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };

  const getDefaultFechaHasta = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleRangoRapido = (dias: number) => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    
    onFechaDesdeChange(desde.toISOString().split('T')[0]);
    onFechaHastaChange(hasta.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-[#0f1b2e]/70 backdrop-blur-sm rounded-xl shadow-lg shadow-black/30 p-4 sm:p-6 border border-white/10 mb-6">
      <div className="space-y-4">
        {/* Selector de tipo de informe */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Tipo de Informe
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onTipoChange('resumen')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                tipoInforme === 'resumen'
                  ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => onTipoChange('detallado')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                tipoInforme === 'detallado'
                  ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              📋 Detallado por Cliente
            </button>
          </div>
        </div>

        {/* Selector de fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Fecha Desde *
            </label>
            <input
              type="date"
              value={fechaDesde || getDefaultFechaDesde()}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              max={fechaHasta || getDefaultFechaHasta()}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Fecha Hasta *
            </label>
            <input
              type="date"
              value={fechaHasta || getDefaultFechaHasta()}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              min={fechaDesde || getDefaultFechaDesde()}
              max={getDefaultFechaHasta()}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            />
          </div>
        </div>

        {/* Rangos rápidos */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Rangos Rápidos
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleRangoRapido(7)}
              className="px-3 py-1.5 text-sm bg-white/10 text-white/80 rounded-lg hover:bg-white/20 border border-white/20 transition-colors"
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => handleRangoRapido(30)}
              className="px-3 py-1.5 text-sm bg-white/10 text-white/80 rounded-lg hover:bg-white/20 border border-white/20 transition-colors"
            >
              Último mes
            </button>
            <button
              type="button"
              onClick={() => handleRangoRapido(90)}
              className="px-3 py-1.5 text-sm bg-white/10 text-white/80 rounded-lg hover:bg-white/20 border border-white/20 transition-colors"
            >
              Últimos 3 meses
            </button>
            <button
              type="button"
              onClick={() => handleRangoRapido(365)}
              className="px-3 py-1.5 text-sm bg-white/10 text-white/80 rounded-lg hover:bg-white/20 border border-white/20 transition-colors"
            >
              Último año
            </button>
          </div>
        </div>

        {/* Botón generar */}
        <div>
          <button
            onClick={onGenerar}
            disabled={isLoading || !fechaDesde || !fechaHasta}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg hover:from-primary-500 hover:to-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
          >
            {isLoading ? '⏳ Generando...' : '📊 Generar Informe'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InformesToolbar;

