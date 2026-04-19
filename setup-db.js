const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.ldufzxsrjvxaajrvusdw',
  password: 'Nextaldea.Emr',
  database: 'postgres',
});

const sqlCommands = [
  // Categories
  `CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Products
  `CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    sale_price NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Sales
  `CREATE TABLE IF NOT EXISTS public.sales (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    sale_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // RLS
  `ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS public.sales ENABLE ROW LEVEL SECURITY`,

  // Policies - create or replace
  `DROP POLICY IF EXISTS "Allow all" ON public.categories`,
  `DROP POLICY IF EXISTS "Allow all" ON public.products`,
  `DROP POLICY IF EXISTS "Allow all" ON public.sales`,
  
  `CREATE POLICY "Allow all" ON public.categories AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true)`,
  `CREATE POLICY "Allow all" ON public.products AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true)`,
  `CREATE POLICY "Allow all" ON public.sales AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true)`,
];

async function createTables() {
  try {
    console.log('Supabase baglantisi kuruluyor...');
    
    for (const sql of sqlCommands) {
      try {
        await pool.query(sql);
        const preview = sql.substring(0, 40).replace(/\n/g, ' ');
        console.log(`OK ${preview}...`);
      } catch (err) {
        if (err.code === 'EEXIST' || err.message.includes('already exists')) {
          console.log(`INFO: ${sql.substring(0, 40)}...`);
        } else {
          console.error(`ERROR: ${err.message.substring(0, 60)}`);
        }
      }
    }

    console.log('\nTablolar olusturuldu!');

    // Ornek verileri ekle
    console.log('\nOrnek veriler ekleniyor...');

    const categoryRes = await pool.query('SELECT * FROM public.categories');
    if (categoryRes.rows.length === 0) {
      await pool.query(
        `INSERT INTO public.categories (name) VALUES ('Kahvalti'), ('Nargile'), ('Icecekler'), ('Atistirmaliklar') ON CONFLICT DO NOTHING`
      );
      console.log('OK Kategoriler eklendi');
    }

    const productRes = await pool.query('SELECT * FROM public.products');
    if (productRes.rows.length === 0) {
      const cats = await pool.query('SELECT * FROM public.categories');
      const catMap = {};
      cats.rows.forEach(cat => {
        catMap[cat.name] = cat.id;
      });

      await pool.query(
        `INSERT INTO public.products (name, category_id, sale_price) VALUES
        ('Serpme Kahvalti', $1, 75),
        ('Tam Kahvalti', $1, 120),
        ('Nargile (Su)', $2, 45),
        ('Nargile (Meyveli)', $2, 55),
        ('Turk Kahvesi', $3, 25),
        ('Cay', $3, 15)`,
        [catMap['Kahvalti'], catMap['Nargile'], catMap['Icecekler']]
      );
      console.log('OK Urunler eklendi');
    }

    const salesRes = await pool.query('SELECT COUNT(*) FROM public.sales');
    if (parseInt(salesRes.rows[0].count) === 0) {
      const products = await pool.query('SELECT id, sale_price FROM public.products');
      
      let insertQuery = `INSERT INTO public.sales (product_id, quantity, sale_price, created_at) VALUES `;
      const values = [];
      let paramCount = 1;

      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
          const product = products.rows[Math.floor(Math.random() * products.rows.length)];
          values.push(product.id, Math.floor(Math.random() * 5) + 1, product.sale_price, date.toISOString());
          insertQuery += `($${paramCount}, $${paramCount+1}, $${paramCount+2}, $${paramCount+3}),`;
          paramCount += 4;
        }
      }

      insertQuery = insertQuery.slice(0, -1);
      await pool.query(insertQuery, values);
      console.log('OK Satis verileri eklendi');
    }

    console.log('\nTum veriler basarı ile olusturuldu!');
    process.exit(0);
  } catch (err) {
    console.error('Baglanti hatasi:', err.message);
    process.exit(1);
  }
}

createTables();
