import { useState, useMemo } from 'react';
import { Pencil, ReceiptText } from 'lucide-react';
import { useExpensesStore } from '../stores/expensesStore';
import { useAuthStore } from '@/stores/authStore';
import ExpenseDetailModal from './ExpenseDetailModal';
import ExpenseFormModal from './ExpenseFormModal';
import { resolveExpenseTypeIcon } from './expenseTypeIcon';
import type { Expense } from '../types';

function ExpenseCard({
  expense,
  onClick,
  onEdit,
  vendorLabel,
}: {
  expense: Expense;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  vendorLabel?: string | null;
}) {
  const [cardHover, setCardHover] = useState(false);
  const typeSlug = expense.expense_types?.slug || 'general';
  const apiIcon = expense.expense_types?.icon;
  const color = expense.expense_types?.color || '#6B7280';
  const Icon = resolveExpenseTypeIcon(typeSlug, apiIcon);
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

  const shadowIdle = `0 0 0 1px ${color}28, 0 6px 28px -6px ${color}38, 0 0 52px -16px ${color}32, inset 0 1px 0 ${color}18`;
  const shadowHover = `0 0 0 1px ${color}45, 0 14px 44px -8px ${color}50, 0 0 72px -12px ${color}42, inset 0 1px 0 ${color}28`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 p-4 transition-all duration-300 ease-out active:scale-[0.98]"
      style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(15,23,42,0.55) 45%, ${color}14 100%)`,
        boxShadow: cardHover ? shadowHover : shadowIdle,
      }}
    >
      {/* Brillo de color (esquina) */}
      <div
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-2/3 w-2/3 rounded-full opacity-50 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
        style={{
          background: `radial-gradient(circle at center, ${color}55 0%, ${color}18 35%, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
        style={{
          background: `radial-gradient(circle at center, ${color}40 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(145deg, ${color}35, rgba(15,23,42,0.55))`,
            boxShadow: cardHover
              ? `0 0 28px ${color}50, 0 0 0 1px ${color}35 inset`
              : `0 0 20px ${color}35, 0 0 0 1px ${color}22 inset`,
          }}
        >
          <Icon size={20} color={color} strokeWidth={2} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              {expense.description ? (
                <p className="truncate text-sm font-bold text-white">{expense.description}</p>
              ) : (
                <div />
              )}
              <span className="shrink-0 text-sm font-black text-white">{formattedAmount}</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-white/60">{formattedDate}</span>
            {expense.vehicles && (
              <span className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/90 shadow-sm">
                <span className="text-xs">🚗</span> {expense.vehicles.plate}
              </span>
            )}
            {docCount > 0 && (
              <span className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/90 shadow-sm">
                <span className="text-xs">📎</span> {docCount}
              </span>
            )}
            {vendorLabel ? (
              <span className="w-full text-[10px] text-white/45">Vendedor: {vendorLabel}</span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="relative z-10 shrink-0 rounded-lg p-1.5 text-white/35 transition-all hover:bg-emerald-500/15 hover:text-emerald-300"
          title="Editar gasto"
          aria-label="Editar gasto"
        >
          <Pencil size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

interface ExpensesListProps {
  isLoading: boolean;
}

function ExpensesList({ isLoading }: ExpensesListProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = String(user?.rol || '').toLowerCase() === 'admin';
  const { expenses, filters, vendedoresFilter } = useExpensesStore();
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const vendorNameByUserId = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of vendedoresFilter) {
      const name = [v.nombre, v.apellido].filter(Boolean).join(' ').trim();
      m.set(String(v.codigo), name || `Vendedor ${v.codigo}`);
    }
    return m;
  }, [vendedoresFilter]);

  const displayExpenses = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter(
      (e) =>
        (e.description || '').toLowerCase().includes(q) ||
        (e.expense_types?.name || '').toLowerCase().includes(q)
    );
  }, [expenses, filters.search]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (displayExpenses.length === 0 && expenses.length === 0) {
    return (
      <div className="py-16 text-center text-white/30">
        <ReceiptText size={48} className="mx-auto mb-4 opacity-25" strokeWidth={1.5} />
        <p className="text-lg font-medium">No se encontraron gastos</p>
        <p className="mt-1 text-xs">Hacé clic en &quot;Nuevo Gasto&quot; para empezar</p>
      </div>
    );
  }

  if (displayExpenses.length === 0) {
    return (
      <div className="py-16 text-center text-white/30">
        <ReceiptText size={48} className="mx-auto mb-4 opacity-25" strokeWidth={1.5} />
        <p className="text-lg font-medium">Ningún gasto coincide con la búsqueda</p>
        <p className="mt-1 text-xs text-white/40">Probá otras palabras o limpiá el filtro de texto</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {displayExpenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            vendorLabel={
              isAdmin
                ? vendorNameByUserId.get(String(expense.user_id)) || `Código ${expense.user_id}`
                : null
            }
            onClick={() => setSelectedExpenseId(expense.id)}
            onEdit={(e) => {
              e.stopPropagation();
              setEditExpense(expense);
            }}
          />
        ))}
      </div>

      {selectedExpenseId && (
        <ExpenseDetailModal expenseId={selectedExpenseId} onClose={() => setSelectedExpenseId(null)} />
      )}

      {editExpense && (
        <ExpenseFormModal
          key={editExpense.id}
          expense={editExpense}
          onClose={() => setEditExpense(null)}
        />
      )}
    </>
  );
}

export default ExpensesList;
