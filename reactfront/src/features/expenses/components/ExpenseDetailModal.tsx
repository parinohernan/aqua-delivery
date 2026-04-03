import { useState, useEffect } from 'react';
import { X, Download, Calendar, Car, FileText, Receipt, Trash2, ExternalLink } from 'lucide-react';
import { expensesService } from '../services/expensesService';
import { useExpensesStore } from '../stores/expensesStore';

interface Props {
  expenseId: string;
  onClose: () => void;
}

export default function ExpenseDetailModal({ expenseId, onClose }: Props) {
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { deleteExpense } = useExpensesStore();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await expensesService.getById(expenseId);
        setExpense(data);
      } catch (err) {
        console.error('Error fetching detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [expenseId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!expense) return null;

  const typeColor = expense.expense_types?.color || '#10b981';
  const formattedAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: expense.currency || 'ARS',
  }).format(expense.amount);

  const handleDelete = async () => {
    if (confirm('¿Eliminar este gasto permanentemente?')) {
      await deleteExpense(expense.id);
      onClose();
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#121225] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="relative p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${typeColor}20`, border: `1px solid ${typeColor}40` }}
            >
              <Receipt size={24} style={{ color: typeColor }} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">
                {expense.expense_types?.name}
              </h2>
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">
                ID: {expense.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col justify-center items-center text-center">
              <span className="text-white/30 text-[10px] font-black uppercase tracking-tighter mb-1">Monto Total</span>
              <span className="text-4xl font-black text-white">{formattedAmount}</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <Calendar size={18} className="text-emerald-400" />
                <span className="text-sm font-medium">{new Date(expense.date).toLocaleString('es-AR')}</span>
              </div>
              {expense.vehicles && (
                <div className="flex items-center gap-3 text-white/80">
                  <Car size={18} className="text-emerald-400" />
                  <span className="text-sm font-medium">{expense.vehicles.plate} - {expense.vehicles.brand} {expense.vehicles.model}</span>
                </div>
              )}
              {expense.description && (
                <div className="flex items-start gap-3 text-white/60">
                  <FileText size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm italic">"{expense.description}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Details */}
          {expense.detail && (
            <div className="space-y-4">
              <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] px-2 text-center md:text-left">Información Técnica</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(expense.detail).map(([key, value]) => {
                  if (['id', 'expense_id', 'created_at', 'vehicle_id'].includes(key) || !value) return null;
                  return (
                    <div key={key} className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                      <p className="text-white/30 text-[9px] uppercase font-bold mb-1">{key.replace(/_/g, ' ')}</p>
                      <p className="text-white text-sm font-bold truncate">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {expense.expense_documents?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] px-2 text-center md:text-left">Documentos y Fotos ({expense.expense_documents.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {expense.expense_documents.map((doc: any) => (
                  <div key={doc.id} className="group relative aspect-square rounded-[1.5rem] overflow-hidden bg-white/5 border border-white/10">
                    {doc.file_type.startsWith('image/') ? (
                      <img src={doc.public_url} alt={doc.file_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <FileText size={32} className="text-emerald-400 mb-2" />
                        <span className="text-[10px] text-white/60 font-medium truncate w-full">{doc.file_name}</span>
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.open(doc.public_url, '_blank')}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-md transition-all active:scale-90"
                        title="Ver original"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => handleDownload(doc.public_url, doc.file_name)}
                        className="p-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white shadow-lg transition-all active:scale-90"
                        title="Descargar"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button 
            onClick={handleDelete}
            className="flex-1 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-all flex items-center justify-center gap-2 border border-red-500/10"
          >
            <Trash2 size={16} />
            Eliminar Gasto
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all border border-white/5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
