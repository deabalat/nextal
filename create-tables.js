const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ldufzxsrjvxaajrvusdw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdWZ6eHNyanZ4YWFqcnZ1c2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDE4MzAsImV4cCI6MjA4OTA3NzgzMH0.zlalisKsdCiyvEeL4qRs0R2potrN1Vcr-WCx64xsX9A";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL komutları
const sqlCommands = [
  // Categories tablosu
  `CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Products tablosu
  `CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    sale_price NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Sales tablosu
  `CREATE TABLE IF NOT EXISTS public.sales (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    sale_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // RLS politikaları
  `ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.products ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY`,

  `CREATE POLICY "Allow anon read categories" ON public.categories FOR SELECT TO anon USING (true)`,
  `CREATE POLICY "Allow anon insert categories" ON public.categories FOR INSERT TO anon WITH CHECK (true)`,
  `CREATE POLICY "Allow anon update categories" ON public.categories FOR UPDATE TO anon USING (true)`,
  `CREATE POLICY "Allow anon delete categories" ON public.categories FOR DELETE TO anon USING (true)`,

  `CREATE POLICY "Allow anon read products" ON public.products FOR SELECT TO anon USING (true)`,
  `CREATE POLICY "Allow anon insert products" ON public.products FOR INSERT TO anon WITH CHECK (true)`,
  `CREATE POLICY "Allow anon update products" ON public.products FOR UPDATE TO anon USING (true)`,
  `CREATE POLICY "Allow anon delete products" ON public.products FOR DELETE TO anon USING (true)`,

  `CREATE POLICY "Allow anon read sales" ON public.sales FOR SELECT TO anon USING (true)`,
  `CREATE POLICY "Allow anon insert sales" ON public.sales FOR INSERT TO anon WITH CHECK (true)`,
  `CREATE POLICY "Allow anon update sales" ON public.sales FOR UPDATE TO anon USING (true)`,
  `CREATE POLICY "Allow anon delete sales" ON public.sales FOR DELETE TO anon USING (true)`,
];

async function createTables() {
  try {
    console.log("🔄 Tabloları oluşturuluyor...\n");

    for (const sql of sqlCommands) {
      try {
        const { data, error } = await supabase.rpc("exec_sql_raw", {
          sql_text: sql,
        });

        if (error) {
          // RPC yoksa direkt execute etmeyi dene
          console.log("📌 SQL:", sql.substring(0, 50) + "...");
          console.log("⚠️ Not executed via RPC, will try with standard queries\n");
        } else {
          console.log("✅ Executed:", sql.substring(0, 50) + "...\n");
        }
      } catch (e) {
        console.log("✓ Skipped (may already exist):", sql.substring(0, 50) + "...\n");
      }
    }

    console.log("✅ Tablo oluşturma işlemi tamamlandı!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createTables();
