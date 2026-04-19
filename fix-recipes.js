const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.ldufzxsrjvxaajrvusdw',
  password: 'Nextaldea.Emr',
  database: 'postgres',
});

async function fixRecipes() {
  try {
    // Add product_id column if missing
    await pool.query(`
      ALTER TABLE IF EXISTS public.recipes 
      ADD COLUMN IF NOT EXISTS product_id BIGINT 
      REFERENCES public.products(id) ON DELETE CASCADE
    `);
    console.log('OK: product_id added to recipes');

    // Check recipes structure
    const res = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'recipes'
    `);
    console.log('Recipes columns:', res.rows.map(r => r.column_name));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixRecipes();
