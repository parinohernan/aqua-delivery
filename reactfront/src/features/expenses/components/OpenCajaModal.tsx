import React, { useState } from 'react';
import { useCashStore } from '../stores/cashStore';
import { Unlock, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const OpenCajaModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [monto, setMonto] = useState<string>('');
  const openSession = useCashStore(state => state.openSession);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await openSession(parseFloat(monto) || 0);
      onClose();
    } catch (err) {
      alert('Error al abrir la caja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#152033] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-600/20 to-transparent">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Unlock className="w-5 h-5 text-blue-400" />
            Abrir Caja
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Monto Inicial en Efectivo</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                autoFocus
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
              />
            </div>
            <p className="text-xs text-blue-400/60 italic">Ingresa con cuánto efectivo inicias tu turno hoy.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Procesando...' : 'Abrir Caja'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OpenCajaModal;
