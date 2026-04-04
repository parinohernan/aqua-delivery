import { create } from 'zustand';
import { expensesService } from '../services/expensesService';
import { vendedoresService } from '@/features/gps/services/vendedoresService';
import type { Expense, ExpenseType, Vehicle, CreateExpensePayload } from '../types';
import type { VendedorLista } from '@/types/entities';

interface ExpensesFilters {
  search: string;
  type: string;      // expense_type slug
  vehicle_id: string;
  date_from: string;
  date_to: string;
  /** Admin: código vendedor; vacío = todos */
  user_id: string;
}

interface ExpensesState {
  // Data
  expenses: Expense[];
  expenseTypes: ExpenseType[];
  vehicles: Vehicle[];
  /** Lista para filtro por vendedor (solo admin). */
  vendedoresFilter: VendedorLista[];

  // UI State
  isLoading: boolean;
  error: string | null;
  filters: ExpensesFilters;

  // Actions
  loadExpenses: () => Promise<void>;
  loadExpenseTypes: () => Promise<void>;
  loadVehicles: () => Promise<void>;
  loadVendedoresFilter: () => Promise<void>;
  createExpense: (data: CreateExpensePayload) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<CreateExpensePayload>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  createVehicle: (data: Partial<Vehicle>) => Promise<Vehicle>;
  setFilters: (filters: Partial<ExpensesFilters>) => void;
  clearFilters: () => void;
  setError: (error: string | null) => void;
}

const initialFilters: ExpensesFilters = {
  search: '',
  type: '',
  vehicle_id: '',
  date_from: '',
  date_to: '',
  user_id: '',
};

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  expenseTypes: [],
  vehicles: [],
  vendedoresFilter: [],
  isLoading: false,
  error: null,
  filters: initialFilters,

  loadExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const expenses = await expensesService.getAll({
        type: filters.type || undefined,
        vehicle_id: filters.vehicle_id || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        user_id: filters.user_id || undefined,
        limit: 200,
      });
      set({ expenses });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error loading expenses';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  loadExpenseTypes: async () => {
    try {
      const expenseTypes = await expensesService.getExpenseTypes();
      set({ expenseTypes });
    } catch (error) {
      console.error('Error loading expense types:', error);
    }
  },

  loadVehicles: async () => {
    try {
      const vehicles = await expensesService.getVehicles();
      set({ vehicles });
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  },

  loadVendedoresFilter: async () => {
    try {
      const vendedoresFilter = await vendedoresService.list();
      set({ vendedoresFilter });
    } catch (error) {
      console.error('Error loading vendedores for expenses filter:', error);
    }
  },

  createExpense: async (data) => {
    try {
      const expense = await expensesService.create(data);
      await get().loadExpenses();
      return expense;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error creating expense';
      set({ error: msg });
      throw error;
    }
  },

  updateExpense: async (id, data) => {
    try {
      await expensesService.update(id, data);
      await get().loadExpenses();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error updating expense';
      set({ error: msg });
      throw error;
    }
  },

  deleteExpense: async (id) => {
    try {
      await expensesService.delete(id);
      await get().loadExpenses();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error deleting expense';
      set({ error: msg });
      throw error;
    }
  },

  createVehicle: async (data) => {
    try {
      const vehicle = await expensesService.createVehicle(data);
      await get().loadVehicles();
      return vehicle;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error creating vehicle';
      set({ error: msg });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    const keys = Object.keys(newFilters);
    const onlySearch = keys.length === 1 && keys[0] === 'search';
    if (!onlySearch) {
      get().loadExpenses();
    }
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().loadExpenses();
  },

  setError: (error) => set({ error }),
}));
