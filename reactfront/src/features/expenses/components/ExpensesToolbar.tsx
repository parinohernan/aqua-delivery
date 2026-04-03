import { useState } from 'react';
import { Search, Filter, Plus, Car } from 'lucide-react';
import { useExpensesStore } from '../stores/expensesStore';
import ExpenseFormModal from './ExpenseFormModal';
import VehicleFormModal from './VehicleFormModal';

function ExpensesToolbar() {
  const { filters, setFilters, expenseTypes, vehicles } = useExpensesStore();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <div className="space-y-3">
        {/* Search + Actions */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              id="expense-search"
              type="text"
              placeholder="Buscar gastos..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all ${
              showFilters
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
          >
            <Filter size={16} />
          </button>
          <button
            id="new-vehicle-btn"
            onClick={() => setShowVehicleModal(true)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title="Añadir Vehículo"
          >
            <Car size={16} />
          </button>
          <button
            id="new-expense-btn"
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Gasto</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-white/5 border border-white/10 rounded-xl animate-fade-in shadow-xl">
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="px-3 py-2 bg-[#121225] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none"
            >
              <option value="" className="bg-[#1a1a2e]">Todos los Tipos</option>
              {expenseTypes.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#1a1a2e]">{t.name}</option>
              ))}
            </select>
            <select
              id="filter-vehicle"
              value={filters.vehicle_id}
              onChange={(e) => setFilters({ vehicle_id: e.target.value })}
              className="px-3 py-2 bg-[#121225] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none"
            >
              <option value="" className="bg-[#1a1a2e]">Todos los Vehículos</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#1a1a2e]">{v.plate} - {v.brand} {v.model}</option>
              ))}
            </select>
            <input
              id="filter-date-from"
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ date_from: e.target.value })}
              className="px-3 py-2 bg-[#121225] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="From"
            />
            <input
              id="filter-date-to"
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ date_to: e.target.value })}
              className="px-3 py-2 bg-[#121225] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="To"
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showExpenseModal && (
        <ExpenseFormModal onClose={() => setShowExpenseModal(false)} />
      )}
      {showVehicleModal && (
        <VehicleFormModal onClose={() => setShowVehicleModal(false)} />
      )}
    </>
  );
}

export default ExpensesToolbar;
