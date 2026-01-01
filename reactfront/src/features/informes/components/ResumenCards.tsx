import { formatCurrency } from '@/utils/formatters';
import type { InformeResumen } from '../types';

/**
 * Tarjetas de resumen de estadísticas
 */
interface ResumenCardsProps {
  informe: InformeResumen;
}

function ResumenCards({ informe }: ResumenCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Total de Pedidos */}
      <div className="bg-[#0f1b2e]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl">📦</span>
          <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-white/70 mb-1">Total de Pedidos</h3>
        <p className="text-3xl font-bold text-white">{informe.totalPedidos}</p>
        <p className="text-xs text-white/50 mt-1">Pedidos entregados</p>
      </div>

      {/* Total de Clientes */}
      <div className="bg-[#0f1b2e]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl">👥</span>
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-white/70 mb-1">Total de Clientes</h3>
        <p className="text-3xl font-bold text-white">{informe.totalClientes}</p>
        <p className="text-xs text-white/50 mt-1">Clientes únicos</p>
      </div>

      {/* Total de Ventas */}
      <div className="bg-[#0f1b2e]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl">💰</span>
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">💵</span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-white/70 mb-1">Total de Ventas</h3>
        <p className="text-3xl font-bold text-white">{formatCurrency(informe.totalVentas)}</p>
        <p className="text-xs text-white/50 mt-1">Ingresos totales</p>
      </div>
    </div>
  );
}

export default ResumenCards;

