-- FAZA 1: Veritabanı Şeması Güncelleme
-- Tedarikçi, Fatura ve Stok Yönetimi Tabloları

-- 0. RECIPES (Tarif/Malzeme Listesi) - MEVCUT TABLOYU KONTROL ET
-- Eğer recipes tablosu yoksa, aşağıdaki CREATE TABLE çalıştır:
-- CREATE TABLE IF NOT EXISTS recipes (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   product_id UUID,
--   ingredient_name TEXT,
--   gram DECIMAL(10, 2),
--   unit_price DECIMAL(10, 2),
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- 1. SUPPLIERS (Tedarikçiler)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. INVOICES (Faturalar - Başlık)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. INVOICE_ITEMS (Fatura Detay - Malzeme Satırları)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
-- NOT: ingredient_id -> recipes(id) FK constraint parametrik olarak eklenecek

-- 4. INVENTORY (Mevcut Stok Seviyeleri)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL UNIQUE,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
-- NOT: ingredient_id -> recipes(id) FK constraint parametrik olarak eklenecek

-- 5. PRICE_HISTORY (Malzeme Fiyat Değişim Geçmişi)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL,
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by TEXT
);
-- NOT: ingredient_id -> recipes(id) FK constraint parametrik olarak eklenecek

-- İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_invoices_supplier ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_ingredient ON invoice_items(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ingredient ON inventory(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_history_ingredient ON price_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(changed_at);

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================

-- Suppliers tablosuna erişim izni
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to suppliers" ON suppliers;
CREATE POLICY "Allow public access to suppliers" ON suppliers
  USING (true)
  WITH CHECK (true);

-- Invoices tablosuna erişim izni
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to invoices" ON invoices;
CREATE POLICY "Allow public access to invoices" ON invoices
  USING (true)
  WITH CHECK (true);

-- Invoice Items tablosuna erişim izni
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to invoice_items" ON invoice_items;
CREATE POLICY "Allow public access to invoice_items" ON invoice_items
  USING (true)
  WITH CHECK (true);

-- Inventory tablosuna erişim izni
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to inventory" ON inventory;
CREATE POLICY "Allow public access to inventory" ON inventory
  USING (true)
  WITH CHECK (true);

-- Price History tablosuna erişim izni (read-only)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to price_history" ON price_history;
CREATE POLICY "Allow public access to price_history" ON price_history
  USING (true)
  WITH CHECK (true);
