import { Fuel, AlertTriangle, Wrench, Settings, Receipt, Milestone, ParkingSquare, Utensils, Trash2 } from 'lucide-react';
import { useExpensesStore } from '../stores/expensesStore';
import type { Expense } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  fuel: Fuel,
  fine: AlertTriangle,
  repair: Wrench,
  maintenance: Settings,
  general: Receipt,
  toll: Milestone,
  parking: ParkingSquare,
  food: Utensils,
};

function ExpenseCard({ expense }: { expense: Expense }) {
  const { deleteExpense } = useExpensesStore();
  const typeSlug = expense.expense_types?.slug || 'general';
  const Icon = ICON_MAP[typeSlug] || Receipt;
  const color = expense.expense_types?.color || '#6B7280';
  const docCount = expense.expense_documents?.length || 0;

  const formattedAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: expense.currency || 'ARS',
  }).format(expense.amount);

  const formattedDate = new Date(expense.date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async () => {
    if (confirm('¿Eliminar este gasto?')) {
      await deleteExpense(expense.id);
    }
  };

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all group">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={18} style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm truncate">
              {expense.expense_types?.name || 'Expense'}
            </h3>
            <span className="text-white font-bold text-sm">{formattedAmount}</span>
          </div>

          {expense.description && (
            <p className="text-white/40 text-xs mt-0.5 truncate">{expense.description}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-white/30 text-[11px]">
            <span>{formattedDate}</span>
            {expense.vehicles && (
              <span className="bg-white/5 px-2 py-0.5 rounded-md">
                🚗 {expense.vehicles.plate}
              </span>
            )}
            {docCount > 0 && (
              <span className="bg-white/5 px-2 py-0.5 rounded-md">
                📎 {docCount}
              </span>
            )}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface ExpensesListProps {
  isLoading: boolean;
}

function ExpensesList({ isLoading }: ExpensesListProps) {
  const { expenses } = useExpensesStore();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-white/30">
        <Receipt size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No expenses found</p>
        <p className="text-sm mt-1">Click "New Expense" to add your first one</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  );
}

export default ExpensesList;
