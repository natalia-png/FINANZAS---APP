-- =========================================
-- FINANZAS NAT & ALEJO - Esquema Supabase
-- Ejecutar en el SQL Editor de Supabase
-- =========================================

-- Ingresos (por persona)
CREATE TABLE IF NOT EXISTS incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona TEXT NOT NULL CHECK (persona IN ('nat', 'alejo')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos (por persona)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona TEXT NOT NULL CHECK (persona IN ('nat', 'alejo')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deudas (por persona)
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona TEXT NOT NULL CHECK (persona IN ('nat', 'alejo')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  amount_paid NUMERIC(12, 2) DEFAULT 0,
  description TEXT NOT NULL,
  creditor TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viajes compartidos
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  budget NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos compartidos
CREATE TABLE IF NOT EXISTS shared_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  paid_by TEXT NOT NULL CHECK (paid_by IN ('nat', 'alejo')),
  split_type TEXT DEFAULT 'equal' CHECK (split_type IN ('equal', 'nat', 'alejo')),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_incomes_persona_month ON incomes(persona, month, year);
CREATE INDEX IF NOT EXISTS idx_expenses_persona_month ON expenses(persona, month, year);
CREATE INDEX IF NOT EXISTS idx_debts_persona ON debts(persona);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_month ON shared_expenses(month, year);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_trip ON shared_expenses(trip_id);

-- =========================================
-- NOTA: Esta app es personal (sin auth por ahora)
-- Si quieres agregar autenticación después,
-- activa RLS y agrega políticas de acceso.
-- =========================================
