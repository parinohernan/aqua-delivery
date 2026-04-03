import { create } from 'zustand';
import { expensesService } from '../services/expensesService';
import type { Expense, ExpenseType, Vehicle, CreateExpensePayload } from '../types';

interface ExpensesFilters {
  search: string;
  type: string;      // expense_type slug
  vehicle_id: string;
  date_from: string;
  date_to: string;
}

interface ExpensesState {
  // Data
  expenses: Expense[];
  expenseTypes: ExpenseType[];
  vehicles: Vehicle[];

  // UI State
  isLoading: boolean;
  error: string | null;
  filters: ExpensesFilters;

  // Actions
  loadExpenses: () => Promise<void>;
  loadExpenseTypes: () => Promise<void>;
  loadVehicles: () => Promise<void>;
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
};

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  expenseTypes: [],
  vehicles: [],
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
    get().loadExpenses();
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().loadExpenses();
  },

  setError: (error) => set({ error }),
}));
