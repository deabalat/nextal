# 🚀 SETUP - Tablolar Oluşturma

## ⚡ 1️⃣ SUPABASE'DE MIGRATION ÇALIŞTIR

### A) Supabase Dashboard'a Git
```
https://app.supabase.com → Projenin seç
```

### B) SQL Editor Aç
```
Sol Sidebar → SQL Editor (veya direktly aç)
```

### C) Entire Migration'ı Kopyala ve Çalıştır
1. Aşağıdaki SQL'i **TÜMÜYLE** kopyala
2. Supabase SQL Editor'e yapıştır
3. **Execute** (Yeşil ► Buton) tıkla
4. **Başarı mesajı** göreceksin

---

## 📋 ÇALIŞTIRILACAK SQL (Kopyala)

```sql
-- FAZA 1: Veritabanı Şeması - Tablolar ve Policies

-- 1. SUPPLIERS (Tedarikçiler)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. INVOICES (Faturalar)
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

-- 3. INVOICE_ITEMS (Fatura Detayları)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. INVENTORY (Stok Seviyeleri)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL UNIQUE,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. PRICE_HISTORY (Fiyat Geçmişi)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL,
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by TEXT
);

-- 6. İndeksler (Performans)
CREATE INDEX IF NOT EXISTS idx_invoices_supplier ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_ingredient ON invoice_items(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ingredient ON inventory(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_history_ingredient ON price_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(changed_at);

-- 7. RLS POLICIES (Erişim İzinleri)

-- Suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to suppliers" ON suppliers;
CREATE POLICY "Allow public access to suppliers" ON suppliers
  USING (true) WITH CHECK (true);

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to invoices" ON invoices;
CREATE POLICY "Allow public access to invoices" ON invoices
  USING (true) WITH CHECK (true);

-- Invoice Items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to invoice_items" ON invoice_items;
CREATE POLICY "Allow public access to invoice_items" ON invoice_items
  USING (true) WITH CHECK (true);

-- Inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to inventory" ON inventory;
CREATE POLICY "Allow public access to inventory" ON inventory
  USING (true) WITH CHECK (true);

-- Price History
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to price_history" ON price_history;
CREATE POLICY "Allow public access to price_history" ON price_history
  USING (true) WITH CHECK (true);
```

---

## ✅ Başarı Göstergeleri

Birisi bu mesajları göreceksin:
- ✅ "Successfully created table" (her tablo için)
- ✅ "policy is not exists" (RLS için - önemli değil)
- ✅ Kırmızı HATA YOK

Eğer hata görürsen → Bana screenshot gönder!

---

## ⚙️ 2️⃣ ENV KONTROLÜ

Dosya al: `.env.local`

İçinde şu 2 satır var mı?
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
```

Yoksa: Supabase Dashboard → Settings → API Keys → Kopyala/Yapıştır

---

## 🧪 3️⃣ TEST - Uygulamayı Başlat

```bash
npm run dev
```

Tarayıcı açılacak: `http://localhost:3000`

### Test Adımları:
1. **📦 Tedarikçiler** sayfasına git (`/suppliers`)
   - Yeni tedarikçi ekle (örn: "Kahve Ltd")
   - ✅ Gözükmesi lazım

2. **📄 Faturalar** sayfasına git (`/invoices`)
   - Tedarikçi seç
   - Malzeme ekle (recipes'den)
   - Kaydet
   - ✅ "Fatura kaydedildi" mesajı lazım

3. **📈 Stok** sayfasına git (`/inventory`)
   - Stok listesi görünmeli
   - ✅ Fatura eklediğin malzemenin stoku artmış mı? 

4. **💰 Raporlar** sayfasına git (`/reports`)
   - Tarih aralığı seç
   - Rapor Oluştur
   - ✅ Satış detayları görünmeli

---

## 🆘 Sorun Varsa

1. **"suppliers.map is not a function"** → `.env.local` kontrol et
2. **Blank page** → Browser console'u aç (F12) → Hatanın ne olduğunu söyle
3. **API error** → Migration'ın başarılı olduğunu kontrol et (Supabase → Table Editor → tablolar gözükmeli)

---

**Başarılar!** ☕📊
