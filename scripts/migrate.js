#!/usr/bin/env node
/**
 * Database Migration Script
 * Run: node scripts/migrate.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Environment variables yükle
require("dotenv-flow").config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_ADMIN_KEY; // Bu lazım

if (!SUPABASE_URL || !SUPABASE_ADMIN_KEY) {
  console.error(
    "❌ Hata: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_ADMIN_KEY env variables gerekli"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY);

async function runMigration() {
  try {
    console.log("🔧 Veritabanı migration başlıyor...\n");

    // SQL dosyasını oku
    const sqlPath = path.join(__dirname, "../migrations/001_create_tables.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // SQL komutlarını ayır (;'ye göre)
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    let count = 0;
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc("exec", { sql: statement });
        if (error) {
          console.warn(`⚠️  ${statement.substring(0, 50)}...\n   ${error.message}`);
        } else {
          console.log(`✅ ${statement.substring(0, 60)}...`);
          count++;
        }
      } catch (err) {
        if (err.message.includes("relation already exists")) {
          console.log(`⏭️  ${statement.substring(0, 60)}... (zaten var)`);
        } else {
          console.error(`❌ Error: ${err.message}`);
        }
      }
    }

    console.log(`\n✨ Migration tamamlandı! (${count} komut çalıştırıldı)`);
  } catch (error) {
    console.error("❌ Migration hatası:", error.message);
    process.exit(1);
  }
}

runMigration();
