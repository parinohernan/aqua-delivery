import React, { useEffect, useState } from 'react';
import { useCashStore } from '../stores/cashStore';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Lock, 
  Unlock, 
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import OpenCajaModal from './OpenCajaModal';
import CloseCajaModal from './CloseCajaModal';

const CajaSection: React.FC = () => {
  const { activeSession, summary, isLoading, fetchActiveSession, refreshSummary } = useCashStore();
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  if (isLoading && !activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Cargando estado de caja...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-400" />
            Caja Diaria
          </h1>
          <p className="text-gray-400 mt-1">
            {activeSession 
              ? `Sesión abierta desde las ${new Date(activeSession.fechaApertura).toLocaleTimeString()}`
              : 'No hay ninguna sesión de caja abierta'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => refreshSummary()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95"
            title="Refrescar balance"
          >
            <RefreshCw className={`w-5 h-5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {activeSession ? (
            <button
              onClick={() => setIsClosing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-all font-semibold shadow-lg shadow-red-500/10 active:scale-95"
            >
              <Lock className="w-5 h-5" />
              Cerrar Caja
            </button>
          ) : (
            <button
              onClick={() => setIsOpening(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Unlock className="w-5 h-5" />
              Abrir Caja
            </button>
          )}
        </div>
      </div>

      {!activeSession ? (
        <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-2xl text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Empieza tu jornada</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Debes abrir la caja con el monto inicial que tienes en efectivo para comenzar a registrar cobranzas y gastos.
          </p>
          <button
            onClick={() => setIsOpening(true)}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20"
          >
            Abrir Caja Ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tarjetas de Resumen */}
          <SummaryCard 
            title="Monto Inicial" 
            amount={summary?.montoInicial || 0} 
            icon={<Wallet className="w-5 h-5" />} 
            color="blue"
          />
          <SummaryCard 
            title="Cobranzas" 
            amount={summary?.totalCobros || 0} 
            icon={<ArrowUpCircle className="w-5 h-5" />} 
            color="green"
          />
          <SummaryCard 
            title="Gastos de Caja" 
            amount={summary?.totalGastos || 0} 
            icon={<ArrowDownCircle className="w-5 h-5" />} 
            color="red"
          />
          <SummaryCard 
            title="Balance Esperado" 
            amount={summary?.balanceEsperado || 0} 
            icon={<TrendingUp className="w-5 h-5" />} 
            color="purple"
            highlight
          />
        </div>
      )}

      {/* Alerta de cierre si hay mucha diferencia? (Opcional para después) */}
      
      {/* Modales */}
      <OpenCajaModal 
        isOpen={isOpening} 
        onClose={() => setIsOpening(false)} 
      />
      
      {summary && (
        <CloseCajaModal 
          isOpen={isClosing} 
          onClose={() => setIsClosing(false)}
          expectedAmount={summary.balanceEsperado}
        />
      )}
    </div>
  );
};

interface CardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
  highlight?: boolean;
}

const SummaryCard: React.FC<CardProps> = ({ title, amount, icon, color, highlight }) => {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    red: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400',
    purple: 'from-violet-500/20 to-violet-600/5 border-violet-500/30 text-violet-400',
  };

  return (
    <div className={`p-6 rounded-2xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm ${highlight ? 'ring-2 ring-violet-500/50 scale-105 md:scale-100 lg:scale-105' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium uppercase tracking-wider opacity-80">{title}</span>
        <div className={`p-2 rounded-lg bg-white/10 ${colors[color].split(' ')[2]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-white">
        ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export default CajaSection;
