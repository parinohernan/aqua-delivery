import { useState, useEffect } from 'react';
import { X, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useExpensesStore } from '../stores/expensesStore';
import { useAuthStore } from '@/stores/authStore';
import { expensesService } from '../services/expensesService';
import { fileToBase64, getFilePreview } from '../utils/fileUtils';
import type { CreateExpensePayload } from '../types';

interface Props {
  onClose: () => void;
}

// Fields that appear for each detail type
const DETAIL_FIELDS: Record<string, { label: string; key: string; type: string; options?: { value: string; label: string }[] }[]> = {
  fuel_loads: [
    { label: 'Litros', key: 'liters', type: 'number' },
    { label: 'Precio por Litro', key: 'price_per_liter', type: 'number' },
    { label: 'Odómetro (km)', key: 'odometer_km', type: 'number' },
    { label: 'Tipo de Combustible', key: 'fuel_type', type: 'select', options: [
      { value: 'nafta_super', label: 'Nafta Súper' },
      { value: 'nafta_premium', label: 'Nafta Premium' },
      { value: 'diesel', label: 'Diesel' },
      { value: 'gnc', label: 'GNC' },
      { value: 'other', label: 'Otro' },
    ]},
    { label: 'Estación de Servicio', key: 'station_name', type: 'text' },
  ],
  fines: [
    { label: 'Tipo de Infracción', key: 'violation_type', type: 'select', options: [
      { value: 'speeding', label: 'Exceso de Velocidad' },
      { value: 'parking', label: 'Estacionamiento' },
      { value: 'documentation', label: 'Documentación' },
      { value: 'other', label: 'Otro' },
    ]},
    { label: 'Autoridad', key: 'authority', type: 'text' },
    { label: 'Fecha de Vencimiento', key: 'due_date', type: 'date' },
  ],
  repairs: [
    { label: 'Repuesto/Parte', key: 'part_name', type: 'text' },
    { label: 'Tipo de Reparación', key: 'repair_type', type: 'select', options: [
      { value: 'preventive', label: 'Preventivo' },
      { value: 'corrective', label: 'Correctivo' },
      { value: 'emergency', label: 'Emergencia' },
    ]},
    { label: 'Taller', key: 'workshop_name', type: 'text' },
    { label: 'Garantía hasta', key: 'warranty_until', type: 'date' },
    { label: 'Notas', key: 'notes', type: 'text' },
  ],
  maintenances: [
    { label: 'Tipo de Mantenimiento', key: 'maintenance_type', type: 'select', options: [
      { value: 'oil_change', label: 'Cambio de Aceite' },
      { value: 'tire_rotation', label: 'Rotación de Cubiertas' },
      { value: 'filter_change', label: 'Cambio de Filtros' },
      { value: 'sanitization', label: 'Desinfección' },
      { value: 'general_checkup', label: 'Revisión General' },
      { value: 'brake_check', label: 'Frenos' },
      { value: 'other', label: 'Otro' },
    ]},
    { label: 'Odómetro (km)', key: 'odometer_km', type: 'number' },
    { label: 'Próximo Service (km)', key: 'next_km', type: 'number' },
    { label: 'Próxima Fecha Service', key: 'next_date', type: 'date' },
    { label: 'Notas', key: 'notes', type: 'text' },
  ],
};

const inputClass = 'w-full px-3 py-2.5 bg-[#121225] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors selection:bg-emerald-500/30';
const labelClass = 'block text-white/50 text-xs font-medium mb-1';

function ExpenseFormModal({ onClose }: Props) {
  const { expenseTypes, vehicles, createExpense } = useExpensesStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    vehicle_id: '',
    date: new Date().toISOString().slice(0, 16),
  });
  const [detailData, setDetailData] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const selectedType = expenseTypes.find((t) => t.id === selectedTypeId);
  const detailTable = selectedType?.detail_table;
  const detailFields = detailTable ? DETAIL_FIELDS[detailTable] || [] : [];

  // --- Auto-Calculation Logic ---
  useEffect(() => {
    if (detailTable === 'fuel_loads' && formData.amount && detailData.liters) {
      const amount = parseFloat(formData.amount);
      const liters = parseFloat(detailData.liters);
      if (amount > 0 && liters > 0) {
        const pricePerLiter = (amount / liters).toFixed(2);
        if (detailData.price_per_liter !== pricePerLiter) {
          setDetailData((prev: Record<string, string>) => ({ ...prev, price_per_liter: pricePerLiter }));
        }
      }
    }
  }, [formData.amount, detailData.liters, detailTable, detailData.price_per_liter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = user?.id || (user as any)?.codigo || (user as any)?.vendedor_id;
    
    if (!selectedTypeId || !formData.amount || !userId) {
      console.warn('❌ Missing data:', { selectedTypeId, amount: formData.amount, userId });
      alert('Error: Datos incompletos o sesión no detectada.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateExpensePayload = {
        user_id: String(userId),
        app_id: 'ed91a7e8-e029-46e3-b382-70bee7c7903e', 
        expense_type_id: selectedTypeId,
        vehicle_id: formData.vehicle_id || undefined,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        detail: detailFields.length > 0 ? detailData : undefined,
      };

      // 1. Create the expense
      const expense = await createExpense(payload);

      // 2. Upload documents if any
      if (selectedFiles.length > 0 && expense.id) {
        const filesToUpload = await Promise.all(
          selectedFiles.map(async (file) => ({
            file_name: file.name,
            file_type: file.type,
            base64: await fileToBase64(file),
          }))
        );
        await expensesService.uploadDocuments(expense.id, filesToUpload);
      }

      onClose();
    } catch (err) {
      console.error('Error creating expense or uploading docs:', err);
      alert('Error de servidor al guardar. Revisá la consola.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev: File[]) => [...prev, ...files]);
      
      const newPreviews = files.map((file: File) => getFilePreview(file));
      setPreviews((prev: string[]) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
    setPreviews((prev: string[]) => {
      // Importante: liberar la memoria de la URL creada
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_: string, i: number) => i !== index);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Nuevo Gasto</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Expense Type */}
          <div>
            <label className={labelClass}>Tipo de Gasto *</label>
            <div className="grid grid-cols-4 gap-2">
              {expenseTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedTypeId(t.id); setDetailData({}); }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedTypeId === t.id
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg block mb-1" style={{ color: t.color }}>
                    {t.icon === 'fuel' ? '⛽' : t.icon === 'alert-triangle' ? '🚨' : t.icon === 'wrench' ? '🔧' : t.icon === 'settings' ? '⚙️' : t.icon === 'milestone' ? '🛣️' : t.icon === 'square-parking' ? '🅿️' : t.icon === 'utensils' ? '🍔' : '🧾'}
                  </span>
                  <span className="text-[10px] leading-tight block">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Monto (ARS) *</label>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input
                id="expense-date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Vehicle */}
          <div>
            <label className={labelClass}>Vehículo</label>
            <select
              id="expense-vehicle"
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className={`${inputClass} appearance-none`}
            >
              <option value="" className="bg-[#1a1a2e]">Ninguno</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#1a1a2e]">{v.plate} - {v.brand} {v.model}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              id="expense-description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass}
              placeholder="Nota opcional..."
            />
          </div>

          {/* Dynamic Detail Fields */}
          {detailFields.length > 0 && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Detalles: {selectedType?.name}
              </h3>
              {detailFields.map((field) => (
                <div key={field.key}>
                  <label className={labelClass}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={detailData[field.key] || ''}
                      onChange={(e) => setDetailData({ ...detailData, [field.key]: e.target.value })}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" className="bg-[#1a1a2e]">Seleccionar...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={detailData[field.key] || ''}
                      onChange={(e) => setDetailData({ ...detailData, [field.key]: e.target.value })}
                      className={inputClass}
                      step={field.type === 'number' ? '0.01' : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-2">
            <label className={labelClass}>Adjuntos (Opcional)</label>
            
            {/* Preview Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {previews.map((url: string, i: number) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-lg text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-emerald-500/50 transition-all group">
                <Camera size={24} className="text-white/30 group-hover:text-emerald-400 mb-1" />
                <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-wider">Tomar Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
              
              <label className="flex flex-col items-center justify-center p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-emerald-500/50 transition-all group">
                <ImageIcon size={24} className="text-white/30 group-hover:text-emerald-400 mb-1" />
                <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-wider">Desde Galería</span>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  multiple 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedTypeId || !formData.amount}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExpenseFormModal;
