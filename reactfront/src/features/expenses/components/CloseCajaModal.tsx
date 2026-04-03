import React, { useState } from 'react';
import { useCashStore } from '../stores/cashStore';
import { Lock, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  expectedAmount: number;
}

const CloseCajaModal: React.FC<Props> = ({ isOpen, onClose, expectedAmount }) => {
  const [actualAmount, setActualAmount] = useState<string>('');
  const closeSession = useCashStore(state => state.closeSession);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await closeSession(parseFloat(actualAmount) || 0);
      onClose();
    } catch (err) {
      alert('Error al cerrar la caja');
    } finally {
      setLoading(false);
    }
  };

  const actual = parseFloat(actualAmount) || 0;
  const difference = actual - expectedAmount;
  const isMatch = Math.abs(difference) < 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#152033] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-red-600/20 to-transparent">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-300" />
            Cerrar Caja
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-sm text-gray-400 mb-1 font-medium">Saldo Esperado</div>
            <div className="text-2xl font-black text-white">
              ${expectedAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Efectivo Real en Mano</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                autoFocus
                placeholder="0.00"
                className={`w-full bg-white/5 border rounded-2xl py-4 pl-10 pr-4 text-3xl font-black text-white focus:outline-none transition-all ${
                  isMatch ? 'border-emerald-500/50 focus:ring-emerald-500/20' : 'border-white/10 focus:ring-red-500/20'
                }`}
              />
            </div>
          </div>

          {actualAmount && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
              isMatch ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              {isMatch ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <div>
                <p className="text-sm font-bold">
                  {isMatch ? 'La caja cuadra perfectamente' : `Diferencia de $${difference.toFixed(2)}`}
                </p>
                <p className="text-xs opacity-80">
                  {difference > 0 ? 'Sobran billetes en la caja.' : difference < 0 ? 'Faltan billetes en la caja.' : 'Todo en orden.'}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] ${
              isMatch ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600 shadow-red-500/10'
            }`}
          >
            {loading ? 'Procesando...' : 'Finalizar y Cerrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CloseCajaModal;
