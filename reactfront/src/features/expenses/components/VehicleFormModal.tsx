import { useState } from 'react';
import { X, Car } from 'lucide-react';
import { useExpensesStore } from '../stores/expensesStore';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  onClose: () => void;
}

const inputClass = 'w-full px-3 py-2.5 bg-[#121225] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors selection:bg-emerald-500/30';
const labelClass = 'block text-white/50 text-xs font-medium mb-1';

function VehicleFormModal({ onClose }: Props) {
  const { createVehicle } = useExpensesStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    current_km: '',
    type: 'car' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Detectamos el ID ya sea como numerico o string, de vendedor o usuario
    const userId = user?.id || (user as any)?.codigo || (user as any)?.vendedor_id;
    
    if (!formData.plate || !userId) {
      console.warn('❌ Missing data:', { plate: formData.plate, userId });
      alert('Error: No se pudo detectar el ID de usuario. Por favor, re-inicia sesión.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createVehicle({
        user_id: String(userId),
        plate: formData.plate.toUpperCase(), // Patente siempre en mayúsculas
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        current_km: formData.current_km ? parseFloat(formData.current_km) : 0,
        type: formData.type,
      } as any);
      onClose();
    } catch (err) {
      console.error('Error creating vehicle:', err);
      alert('Error de servidor al crear vehículo. Revisá la consola.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (key: string, value: string) => setFormData({ ...formData, [key]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Nuevo Vehículo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Patente *</label>
            <input id="vehicle-plate" type="text" required value={formData.plate} onChange={(e) => update('plate', e.target.value)} className={inputClass} placeholder="AB 123 CD" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Marca</label>
              <input id="vehicle-brand" type="text" value={formData.brand} onChange={(e) => update('brand', e.target.value)} className={inputClass} placeholder="Toyota" />
            </div>
            <div>
              <label className={labelClass}>Modelo</label>
              <input id="vehicle-model" type="text" value={formData.model} onChange={(e) => update('model', e.target.value)} className={inputClass} placeholder="Hilux" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Año</label>
              <input id="vehicle-year" type="number" value={formData.year} onChange={(e) => update('year', e.target.value)} className={inputClass} placeholder="2024" />
            </div>
            <div>
              <label className={labelClass}>Km Actual</label>
              <input id="vehicle-km" type="number" value={formData.current_km} onChange={(e) => update('current_km', e.target.value)} className={inputClass} placeholder="50000" />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select id="vehicle-type" value={formData.type} onChange={(e) => update('type', e.target.value)} className={`${inputClass} appearance-none`}>
                <option value="car" className="bg-[#1a1a2e]">Auto</option>
                <option value="truck" className="bg-[#1a1a2e]">Camión</option>
                <option value="van" className="bg-[#1a1a2e]">Furgoneta</option>
                <option value="motorcycle" className="bg-[#1a1a2e]">Moto</option>
                <option value="other" className="bg-[#1a1a2e]">Otro</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.plate}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Vehículo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VehicleFormModal;
