import { useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { useExpensesStore } from '../stores/expensesStore';
import { useAuthStore } from '@/stores/authStore';
import ExpensesToolbar from './ExpensesToolbar';
import ExpensesList from './ExpensesList';

function ExpensesSection() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = String(user?.rol || '').toLowerCase() === 'admin';
  const { loadExpenses, loadExpenseTypes, loadVehicles, loadVendedoresFilter, isLoading, error, expenses } =
    useExpensesStore();

  useEffect(() => {
    loadExpenses();
    loadExpenseTypes();
    loadVehicles();
  }, [loadExpenses, loadExpenseTypes, loadVehicles]);

  useEffect(() => {
    if (isAdmin) {
      void loadVendedoresFilter();
    }
  }, [isAdmin, loadVendedoresFilter]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Receipt size={16} className="text-white" />
          </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Módulo de Gastos</h1>
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">Gestión de Flota y Mantenimiento</p>
          {expenses.length > 0 && (
            <span className="text-white/50 text-sm font-medium">
              ({expenses.length})
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <ExpensesToolbar />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-3 animate-fade-in">
          <span className="text-xl">⚠️</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* List */}
      <ExpensesList isLoading={isLoading} />
    </div>
  );
}

export default ExpensesSection;
