// Types for the Expenses Module (Supabase)

export interface ExpenseType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  app_id: string | null;
  detail_table: string | null;
}

export interface Vehicle {
  id: string;
  user_id: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  current_km: number;
  type: 'truck' | 'van' | 'motorcycle' | 'car' | 'other';
  status: 'active' | 'inactive' | 'maintenance';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseDocument {
  id: string;
  expense_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  public_url: string;
  file_size: number;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  app_id: string;
  expense_type_id: string;
  vehicle_id: string | null;
  amount: number;
  currency: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  affects_cashier?: boolean;
  // Joined relations
  expense_types?: ExpenseType;
  vehicles?: Pick<Vehicle, 'plate' | 'brand' | 'model'> | null;
  expense_documents?: ExpenseDocument[];
  detail?: FuelLoadDetail | FineDetail | RepairDetail | MaintenanceDetail | null;
}

// Detail types
export interface FuelLoadDetail {
  id: string;
  expense_id: string;
  vehicle_id: string;
  liters: number;
  price_per_liter: number;
  odometer_km: number;
  fuel_type: 'diesel' | 'nafta_super' | 'nafta_premium' | 'gnc' | 'other';
  station_name: string | null;
}

export interface FineDetail {
  id: string;
  expense_id: string;
  vehicle_id: string | null;
  violation_type: 'speeding' | 'parking' | 'documentation' | 'other';
  authority: string | null;
  status: 'pending' | 'paid' | 'disputed' | 'dismissed';
  due_date: string | null;
}

export interface RepairDetail {
  id: string;
  expense_id: string;
  vehicle_id: string;
  part_name: string | null;
  repair_type: 'preventive' | 'corrective' | 'emergency';
  workshop_name: string | null;
  warranty_until: string | null;
  notes: string | null;
}

export interface MaintenanceDetail {
  id: string;
  expense_id: string;
  vehicle_id: string;
  maintenance_type: string;
  odometer_km: number | null;
  next_km: number | null;
  next_date: string | null;
  is_recurring: boolean;
  interval_days: number | null;
  notes: string | null;
}

export interface VehicleStats {
  total_expenses: number;
  total_by_type: Record<string, number>;
  fuel_efficiency_km_per_liter: number | null;
  total_fuel_loads: number;
  upcoming_maintenances: MaintenanceDetail[];
}

// Form types
export interface CreateExpensePayload {
  user_id: string;
  app_id: string;
  expense_type_id: string;
  vehicle_id?: string;
  amount: number;
  currency?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  metadata?: Record<string, unknown>;
  detail?: Partial<FuelLoadDetail | FineDetail | RepairDetail | MaintenanceDetail>;
  affects_cashier?: boolean;
}
