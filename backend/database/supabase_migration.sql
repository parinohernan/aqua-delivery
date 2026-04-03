-- ============================================================
-- EXPENSES MODULE - Supabase Migration
-- Multi-app expense tracking system
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. APPS - Application registry
-- ============================================================
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  plate TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  current_km FLOAT DEFAULT 0,
  type TEXT CHECK (type IN ('truck', 'van', 'motorcycle', 'car', 'other')) DEFAULT 'car',
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. EXPENSE TYPES - Configurable per app
-- ============================================================
CREATE TABLE IF NOT EXISTS expense_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT 'receipt',
  color TEXT DEFAULT '#6B7280',
  app_id UUID REFERENCES apps(id) ON DELETE SET NULL,
  detail_table TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, app_id)
);

-- ============================================================
-- 4. EXPENSES - Base table for all expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  expense_type_id UUID NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_app_id ON expenses(app_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_type ON expenses(expense_type_id);

-- ============================================================
-- 5. FUEL LOADS - Detail: Fuel refills
-- ============================================================
CREATE TABLE IF NOT EXISTS fuel_loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL UNIQUE REFERENCES expenses(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  liters FLOAT NOT NULL,
  price_per_liter FLOAT NOT NULL,
  odometer_km FLOAT NOT NULL,
  fuel_type TEXT CHECK (fuel_type IN ('diesel', 'nafta_super', 'nafta_premium', 'gnc', 'other')) DEFAULT 'nafta_super',
  station_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. FINES - Detail: Traffic/parking fines
-- ============================================================
CREATE TABLE IF NOT EXISTS fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL UNIQUE REFERENCES expenses(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  violation_type TEXT CHECK (violation_type IN ('speeding', 'parking', 'documentation', 'other')) DEFAULT 'other',
  authority TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'disputed', 'dismissed')) DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. REPAIRS - Detail: Vehicle/equipment repairs
-- ============================================================
CREATE TABLE IF NOT EXISTS repairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL UNIQUE REFERENCES expenses(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  part_name TEXT,
  repair_type TEXT CHECK (repair_type IN ('preventive', 'corrective', 'emergency')) DEFAULT 'corrective',
  workshop_name TEXT,
  warranty_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. MAINTENANCES - Detail: Scheduled maintenance
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID UNIQUE REFERENCES expenses(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_type TEXT CHECK (maintenance_type IN (
    'oil_change', 'tire_rotation', 'filter_change',
    'sanitization', 'general_checkup', 'brake_check', 'other'
  )) DEFAULT 'other',
  odometer_km FLOAT,
  next_km FLOAT,
  next_date DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  interval_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. EXPENSE DOCUMENTS - Attachments (photos/PDFs)
-- ============================================================
CREATE TABLE IF NOT EXISTS expense_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expense_documents_expense_id ON expense_documents(expense_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update vehicle current_km on fuel_load insert
CREATE OR REPLACE FUNCTION update_vehicle_km()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vehicles
  SET current_km = NEW.odometer_km, updated_at = NOW()
  WHERE id = NEW.vehicle_id AND current_km < NEW.odometer_km;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fuel_load_update_km
  AFTER INSERT ON fuel_loads
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_km();

-- Auto-update updated_at on expenses
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_documents ENABLE ROW LEVEL SECURITY;

-- Vehicles: users see only their own
CREATE POLICY "Users manage own vehicles" ON vehicles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Expenses: users see only their own
CREATE POLICY "Users manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Detail tables: inherit security via JOIN with expenses
CREATE POLICY "Users manage own fuel_loads" ON fuel_loads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM expenses WHERE expenses.id = fuel_loads.expense_id AND expenses.user_id = auth.uid())
  );

CREATE POLICY "Users manage own fines" ON fines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM expenses WHERE expenses.id = fines.expense_id AND expenses.user_id = auth.uid())
  );

CREATE POLICY "Users manage own repairs" ON repairs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM expenses WHERE expenses.id = repairs.expense_id AND expenses.user_id = auth.uid())
  );

CREATE POLICY "Users manage own maintenances" ON maintenances
  FOR ALL USING (
    EXISTS (SELECT 1 FROM expenses WHERE expenses.id = maintenances.expense_id AND expenses.user_id = auth.uid())
  );

CREATE POLICY "Users manage own expense_documents" ON expense_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM expenses WHERE expenses.id = expense_documents.expense_id AND expenses.user_id = auth.uid())
  );

-- Apps and expense_types are readable by all authenticated users
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read apps" ON apps
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read expense_types" ON expense_types
  FOR SELECT USING (true);

-- ============================================================
-- SEED DATA - Default expense types (global)
-- ============================================================

INSERT INTO apps (name, slug) VALUES
  ('Aqua Delivery Manager', 'adm'),
  ('Personal', 'personal'),
  ('Trucker', 'trucker')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO expense_types (name, slug, icon, color, app_id, detail_table) VALUES
  ('Carga de Combustible', 'fuel',        'fuel',         '#F59E0B', NULL, 'fuel_loads'),
  ('Multa',                'fine',         'alert-triangle','#EF4444', NULL, 'fines'),
  ('Reparación',           'repair',       'wrench',       '#8B5CF6', NULL, 'repairs'),
  ('Mantenimiento',        'maintenance',  'settings',     '#3B82F6', NULL, 'maintenances'),
  ('Gasto General',        'general',      'receipt',      '#6B7280', NULL, NULL),
  ('Peaje',                'toll',         'milestone',    '#10B981', NULL, NULL),
  ('Estacionamiento',      'parking',      'square-parking','#06B6D4', NULL, NULL),
  ('Comida',               'food',         'utensils',     '#F97316', NULL, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STORAGE BUCKET (run via Supabase Dashboard or API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('expense-docs', 'expense-docs', false);
--
-- CREATE POLICY "Users upload own expense docs" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'expense-docs' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "Users read own expense docs" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'expense-docs' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "Users delete own expense docs" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'expense-docs' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
