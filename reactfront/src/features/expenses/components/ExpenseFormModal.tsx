import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Trash2, Loader2, Wallet } from 'lucide-react';
import { useExpensesStore } from '../stores/expensesStore';
import { useAuthStore } from '@/stores/authStore';
import { expensesService } from '../services/expensesService';
import { prepareExpenseDocumentUpload } from '../utils/fileUtils';
import { ExpenseTypeIconDisplay } from './expenseTypeIcon';
import { toast } from '@/utils/feedback';
import type { CreateExpensePayload, Expense } from '../types';

interface Props {
  onClose: () => void;
  /** Si tiene id, modo edición (carga completa con getById) */
  expense?: Expense | null;
}

interface DetailField {
  label: string;
  key: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export const DETAIL_FIELDS: Record<string, DetailField[]> = {
  fuel_loads: [
    { label: 'Litros', key: 'liters', type: 'number', required: true },
    { label: 'Precio por Litro', key: 'price_per_liter', type: 'number', required: true },
    { label: 'Odómetro (km)', key: 'odometer_km', type: 'number', required: true },
    {
      label: 'Tipo de Combustible',
      key: 'fuel_type',
      type: 'select',
      options: [
        { value: 'nafta_super', label: 'Nafta Súper' },
        { value: 'nafta_premium', label: 'Nafta Premium' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'gnc', label: 'GNC' },
        { value: 'other', label: 'Otro' },
      ],
    },
    { label: 'Estación de Servicio', key: 'station_name', type: 'text' },
  ],
  fines: [
    {
      label: 'Tipo de Infracción',
      key: 'violation_type',
      type: 'select',
      options: [
        { value: 'speeding', label: 'Exceso de Velocidad' },
        { value: 'parking', label: 'Estacionamiento' },
        { value: 'documentation', label: 'Documentación' },
        { value: 'other', label: 'Otro' },
      ],
    },
    { label: 'Autoridad', key: 'authority', type: 'text' },
    { label: 'Fecha de Vencimiento', key: 'due_date', type: 'date' },
  ],
  repairs: [
    { label: 'Repuesto/Parte', key: 'part_name', type: 'text' },
    {
      label: 'Tipo de Reparación',
      key: 'repair_type',
      type: 'select',
      options: [
        { value: 'preventive', label: 'Preventivo' },
        { value: 'corrective', label: 'Correctivo' },
        { value: 'emergency', label: 'Emergencia' },
      ],
    },
    { label: 'Taller', key: 'workshop_name', type: 'text' },
    { label: 'Garantía hasta', key: 'warranty_until', type: 'date' },
    { label: 'Notas', key: 'notes', type: 'text' },
  ],
  maintenances: [
    {
      label: 'Tipo de Mantenimiento',
      key: 'maintenance_type',
      type: 'select',
      options: [
        { value: 'oil_change', label: 'Cambio de Aceite' },
        { value: 'tire_rotation', label: 'Rotación de Cubiertas' },
        { value: 'filter_change', label: 'Cambio de Filtros' },
        { value: 'sanitization', label: 'Desinfección' },
        { value: 'general_checkup', label: 'Revisión General' },
        { value: 'brake_check', label: 'Frenos' },
        { value: 'other', label: 'Otro' },
      ],
    },
    { label: 'Odómetro (km)', key: 'odometer_km', type: 'number' },
    { label: 'Próximo Service (km)', key: 'next_km', type: 'number' },
    { label: 'Próxima Fecha Service', key: 'next_date', type: 'date' },
    { label: 'Notas', key: 'notes', type: 'text' },
  ],
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return nowDatetimeLocalValue();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowDatetimeLocalValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local es hora local sin zona; el API/Postgres espera un instante explícito (ISO UTC). */
function datetimeLocalToIsoUtc(datetimeLocal: string): string {
  const trimmed = datetimeLocal.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(trimmed);
  if (m) {
    const d = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
      0,
      0
    );
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function detailToFormData(
  detail: Record<string, unknown> | null | undefined,
  detailTable: string
): Record<string, string> {
  if (!detail) return {};
  const fields = DETAIL_FIELDS[detailTable] || [];
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = detail[f.key];
    if (v === null || v === undefined) continue;
    if (f.type === 'date' && typeof v === 'string') {
      out[f.key] = v.length >= 10 ? v.slice(0, 10) : v;
    } else {
      out[f.key] = String(v);
    }
  }
  return out;
}

const inputClass =
  'w-full px-3 py-2.5 bg-[#121225] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors selection:bg-emerald-500/30';
const labelClass = 'block text-white/50 text-xs font-medium mb-1';

/** Máximo antes de comprimir (multipart); mismo límite que product-image en API. */
const MAX_RECEIPT_UPLOAD_BYTES = 5 * 1024 * 1024;

type AttachmentItem =
  | { kind: 'cloud'; public_url: string; file_name: string; file_type: string }
  | { kind: 'pdf'; file: File };

function isProbablyImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  if (!file.type || file.type === 'application/octet-stream') {
    return /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name);
  }
  return false;
}

function ExpenseFormModal({ onClose, expense }: Props) {
  const { expenseTypes, vehicles, createExpense, updateExpense, loadExpenses } = useExpensesStore();
  const { user } = useAuthStore();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const expenseImageInputRef = useRef<HTMLInputElement>(null);
  const expensePdfInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(expense?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingExpense, setLoadingExpense] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedExpense, setLoadedExpense] = useState<Expense | null>(null);

  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    vehicle_id: '',
    date: new Date().toISOString().slice(0, 16),
  });
  const [affectsCashier, setAffectsCashier] = useState(true);
  const [detailData, setDetailData] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [receiptUploadBusy, setReceiptUploadBusy] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const workingExpense = isEditMode ? loadedExpense : null;
  const selectedType = expenseTypes.find((t) => t.id === selectedTypeId) ?? workingExpense?.expense_types;
  const detailTable = selectedType?.detail_table ?? undefined;
  const detailFields = detailTable ? DETAIL_FIELDS[detailTable] || [] : [];

  useEffect(() => {
    if (isEditMode) return;
    if (!selectedType) return;
    const cashTypes = ['food', 'toll', 'parking', 'general'];
    if (cashTypes.includes(selectedType.slug)) {
      setAffectsCashier(true);
    } else {
      setAffectsCashier(false);
    }
  }, [isEditMode, selectedTypeId, selectedType]);


  useEffect(() => {
    if (!isEditMode || !expense?.id) {
      setLoadedExpense(null);
      setLoadError(null);
      setLoadingExpense(false);
      setAttachments([]);
      setAttachmentError(null);
      return;
    }

    let cancelled = false;
    setLoadingExpense(true);
    setLoadError(null);
    setAttachments([]);
    setAttachmentError(null);

    expensesService
      .getById(expense.id)
      .then((data) => {
        if (!cancelled) setLoadedExpense(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setLoadError('No se pudo cargar el gasto');
      })
      .finally(() => {
        if (!cancelled) setLoadingExpense(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditMode, expense?.id]);

  useEffect(() => {
    if (!loadedExpense) return;

    setSelectedTypeId(loadedExpense.expense_type_id);
    setFormData({
      amount: String(loadedExpense.amount),
      description: loadedExpense.description || '',
      vehicle_id: loadedExpense.vehicle_id || '',
      date: toDatetimeLocalValue(loadedExpense.date),
    });

    const dt = loadedExpense.expense_types?.detail_table;
    if (dt && loadedExpense.detail) {
      setDetailData(
        detailToFormData(loadedExpense.detail as unknown as Record<string, unknown>, dt)
      );
    } else {
      setDetailData({});
    }

    setAffectsCashier(Boolean(loadedExpense.affects_cashier));
  }, [loadedExpense]);

  useEffect(() => {
    if (detailTable === 'fuel_loads' && formData.amount && detailData.liters) {
      const amount = parseFloat(formData.amount);
      const liters = parseFloat(detailData.liters);
      if (amount > 0 && liters > 0) {
        const pricePerLiter = (amount / liters).toFixed(2);
        if (detailData.price_per_liter !== pricePerLiter) {
          setDetailData((prev) => ({ ...prev, price_per_liter: pricePerLiter }));
        }
      }
    }
  }, [formData.amount, detailData.liters, detailTable, detailData.price_per_liter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = user?.id || (user as { codigo?: string })?.codigo || (user as { vendedor_id?: string })?.vendedor_id;

    if (!formData.amount || !userId) {
      alert('Error: Datos incompletos o sesión no detectada.');
      return;
    }

    if (!isEditMode && !selectedTypeId) {
      alert('Elegí un tipo de gasto.');
      return;
    }

    if (receiptUploadBusy) {
      return;
    }

    setIsSubmitting(true);
    try {
      const detailPayload: Record<string, any> = {};
      
      if (detailTable && detailFields.length > 0) {
        for (const f of detailFields) {
          const val = detailData[f.key];
          if (f.type === 'number') {
            detailPayload[f.key] = val ? parseFloat(val) : (f.required ? 0 : null);
          } else {
            detailPayload[f.key] = val || null;
          }
        }
      }

      if (isEditMode && loadedExpense) {
        const updatePayload: Partial<CreateExpensePayload> = {
          amount: parseFloat(formData.amount),
          description: formData.description,
          vehicle_id: formData.vehicle_id || undefined,
          date: datetimeLocalToIsoUtc(formData.date),
          detail: detailPayload,
          affects_cashier: affectsCashier,
        };

        await updateExpense(loadedExpense.id, updatePayload);

        if (attachments.length > 0) {
          const cloudParts = attachments
            .filter((a): a is Extract<AttachmentItem, { kind: 'cloud' }> => a.kind === 'cloud')
            .map((a) => ({
              file_name: a.file_name,
              file_type: a.file_type,
              public_url: a.public_url,
            }));
          const pdfFiles = attachments
            .filter((a): a is Extract<AttachmentItem, { kind: 'pdf' }> => a.kind === 'pdf')
            .map((a) => a.file);
          const pdfParts =
            pdfFiles.length > 0
              ? await Promise.all(pdfFiles.map((file) => prepareExpenseDocumentUpload(file)))
              : [];
          await expensesService.uploadDocuments(loadedExpense.id, [...cloudParts, ...pdfParts]);
          await loadExpenses({ silent: true });
        }

        onCloseRef.current();
        return;
      }

      const payload: CreateExpensePayload = {
        user_id: String(userId),
        app_id: 'ed91a7e8-e029-46e3-b382-70bee7c7903e',
        expense_type_id: selectedTypeId,
        vehicle_id: formData.vehicle_id || undefined,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: datetimeLocalToIsoUtc(formData.date),
        detail: Object.keys(detailPayload).length > 0 ? detailPayload : undefined,
        affects_cashier: affectsCashier,
      };

      const created = await createExpense(payload);

      if (attachments.length > 0 && created.id) {
        const cloudParts = attachments
          .filter((a): a is Extract<AttachmentItem, { kind: 'cloud' }> => a.kind === 'cloud')
          .map((a) => ({
            file_name: a.file_name,
            file_type: a.file_type,
            public_url: a.public_url,
          }));
        const pdfFiles = attachments
          .filter((a): a is Extract<AttachmentItem, { kind: 'pdf' }> => a.kind === 'pdf')
          .map((a) => a.file);
        const pdfParts =
          pdfFiles.length > 0
            ? await Promise.all(pdfFiles.map((file) => prepareExpenseDocumentUpload(file)))
            : [];
        await expensesService.uploadDocuments(created.id, [...cloudParts, ...pdfParts]);
      }

      onCloseRef.current();
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Error de servidor al guardar. Revisá la consola.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Igual que ProductoModal: un archivo, input visible con ref, subida directa (sin canvas). */
  const handleExpenseImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const input = e.target;
    if (!file) return;

    if (file.size > MAX_RECEIPT_UPLOAD_BYTES) {
      setAttachmentError('La imagen no debe superar 5 MB');
      input.value = '';
      return;
    }
    if (!isProbablyImageFile(file)) {
      setAttachmentError('Elegí un archivo de imagen (JPG, PNG, etc.).');
      input.value = '';
      return;
    }

    setAttachmentError(null);
    setReceiptUploadBusy(true);
    try {
      const { imageURL } = await expensesService.uploadExpenseImage(file);
      setAttachments((prev) => [
        ...prev,
        {
          kind: 'cloud',
          public_url: imageURL,
          file_name: file.name || 'imagen.jpg',
          file_type: file.type || 'image/jpeg',
        },
      ]);
      toast.success('Imagen subida correctamente');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo subir la imagen';
      setAttachmentError(msg);
    } finally {
      setReceiptUploadBusy(false);
      input.value = '';
    }
  };

  const handlePdfFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    const input = e.target;
    if (!list?.length) return;

    for (const file of Array.from(list)) {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      if (!isPdf) continue;
      if (file.size > MAX_RECEIPT_UPLOAD_BYTES) {
        setAttachmentError('Cada PDF debe pesar como máximo 5 MB.');
        continue;
      }
      setAttachmentError(null);
      setAttachments((prev) => [...prev, { kind: 'pdf', file }]);
    }
    input.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const existingDocs = workingExpense?.expense_documents ?? [];
  const typeColor = selectedType?.color || '#34d399';
  const modalTitle = isEditMode ? 'Editar gasto' : 'Nuevo gasto';

  const backdropClose = () => onCloseRef.current();

  const modalBody =
    isEditMode && loadingExpense ? (
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a2e] px-10 py-12"
        onClick={(e) => e.stopPropagation()}
      >
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
        <p className="text-sm text-white/70">Cargando gasto…</p>
      </div>
    ) : isEditMode && loadError ? (
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1a2e] p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-red-300">{loadError}</p>
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-white"
        >
          Cerrar
        </button>
      </div>
    ) : (
      <div
        className="w-full max-w-lg bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-5 border-b border-white/10">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{modalTitle}</h2>
              {!isEditMode && (
                <p className="mt-1 text-xs text-white/45">Elegí una categoría y completá los datos</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onCloseRef.current()}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!isEditMode && (
            <div>
              <label className={labelClass}>Tipo de gasto *</label>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-emerald-400/90">
                Elegí una categoría
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {expenseTypes.map((t) => {
                  const selected = selectedTypeId === t.id;
                  const tc = t.color || '#34d399';
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTypeId(t.id);
                        setDetailData({});
                      }}
                      className={`relative overflow-hidden rounded-2xl border p-3 text-center transition-all ${
                        selected
                          ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                      style={{
                        boxShadow: selected ? `0 0 24px ${tc}18` : undefined,
                      }}
                    >
                      <span
                        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                        style={{ backgroundColor: tc }}
                      />
                      <div
                        className="mb-2 flex justify-center rounded-xl p-2"
                        style={{
                          background: `linear-gradient(145deg, ${tc}22, transparent)`,
                        }}
                      >
                        <ExpenseTypeIconDisplay
                          slug={t.slug}
                          icon={t.icon}
                          size={30}
                          color={tc}
                          strokeWidth={2}
                        />
                      </div>
                      <span className="text-[11px] font-semibold leading-tight text-white/90">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isEditMode && workingExpense?.expense_types && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">Tipo de gasto</p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 shadow-inner"
                  style={{
                    background: `linear-gradient(145deg, ${typeColor}35, transparent)`,
                    boxShadow: `0 0 20px ${typeColor}20`,
                  }}
                >
                  <ExpenseTypeIconDisplay
                    slug={workingExpense.expense_types.slug}
                    icon={workingExpense.expense_types.icon}
                    size={26}
                    color={typeColor}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{workingExpense.expense_types.name}</p>
                  <p className="text-xs text-white/45">No se puede cambiar el tipo de un gasto ya registrado</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="expense-amount">
                Monto (ARS) *
              </label>
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
              <label className={labelClass} htmlFor="expense-date">
                Fecha
              </label>
              <input
                id="expense-date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="expense-vehicle">
              Vehículo
            </label>
            <select
              id="expense-vehicle"
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className={`${inputClass} appearance-none`}
            >
              <option value="" className="bg-[#1a1a2e]">
                Ninguno
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#1a1a2e]">
                  {v.plate} - {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="expense-description">
              Descripción
            </label>
            <input
              id="expense-description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass}
              placeholder="Nota opcional..."
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 transition-all hover:bg-white/10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${affectsCashier ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">¿Pagar con efectivo de caja?</p>
                <p className="text-[10px] text-white/40">Si se marca, se restará del saldo de tu caja diaria.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAffectsCashier(!affectsCashier)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                affectsCashier ? 'bg-emerald-600' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  affectsCashier ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {detailFields.length > 0 && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
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
                      <option value="" className="bg-[#1a1a2e]">
                        Seleccionar...
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
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

          {isEditMode && existingDocs.length > 0 && (
            <div>
              <label className={labelClass}>Archivos adjuntos</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {existingDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:border-emerald-500/40"
                  >
                    {doc.file_type?.startsWith('image/') ? (
                      <img
                        src={doc.public_url}
                        alt={doc.file_name}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center p-2 text-center text-[10px] text-white/60">
                        {doc.file_name}
                      </div>
                    )}
                    <span className="truncate px-2 py-1 text-[10px] text-emerald-300/90 group-hover:underline">
                      Ver archivo
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className={labelClass}>
              {isEditMode ? 'Agregar adjuntos (nuevos)' : 'Adjuntos (opcional)'}
            </label>

            {attachmentError && (
              <p className="mb-2 text-xs text-amber-300/90">{attachmentError}</p>
            )}

            {attachments.length > 0 && (
              <div className="mb-3 grid grid-cols-4 gap-2">
                {attachments.map((item, i) => (
                  <div
                    key={`${item.kind}-${i}-${item.kind === 'cloud' ? item.public_url : item.file.name}`}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
                  >
                    {item.kind === 'cloud' ? (
                      <img src={item.public_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-white/5 p-2">
                        <FileText size={28} className="text-white/40" />
                        <span className="line-clamp-2 text-center text-[9px] text-white/50">{item.file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      disabled={receiptUploadBusy}
                      className="absolute right-1 top-1 rounded-lg bg-red-500 p-1 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {receiptUploadBusy && (
              <p className="mb-2 flex items-center gap-2 text-sm text-emerald-300/90">
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                Subiendo imagen…
              </p>
            )}

            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs text-white/50">Subir imagen (Cloudinary, como productos)</p>
                <input
                  ref={expenseImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(ev) => void handleExpenseImageFileChange(ev)}
                  disabled={receiptUploadBusy}
                  className="w-full text-sm text-white/90 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600/50 file:px-4 file:py-2 file:text-white file:cursor-pointer disabled:opacity-50"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs text-white/50">Adjuntar PDF (se envía al guardar)</p>
                <input
                  ref={expensePdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  disabled={receiptUploadBusy}
                  onChange={handlePdfFilesChange}
                  className="w-full text-sm text-white/90 file:mr-3 file:rounded-lg file:border-0 file:bg-white/15 file:px-4 file:py-2 file:text-white file:cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              receiptUploadBusy ||
              (!isEditMode && !selectedTypeId) ||
              !formData.amount ||
              (isEditMode && !loadedExpense)
            }
            className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? 'Guardando…' : isEditMode ? 'Guardar cambios' : 'Guardar gasto'}
          </button>
        </form>
      </div>
    );

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{ isolation: 'isolate' }}
      onClick={backdropClose}
    >
      {modalBody}
    </div>,
    document.body
  );
}

export default ExpenseFormModal;
