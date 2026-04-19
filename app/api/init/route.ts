import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST: Initialize database tables
export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Veritabanı başlatılıyor...");

    // 1. Categories kontrol ve oluştur
    try {
      await supabase.from("categories").select("id").limit(1);
      console.log("✅ Categories tablosu zaten var");
    } catch {
      console.log("📝 Categories tablosu oluşturuluyor...");
      const { error } = await supabase.rpc("exec_sql", {
        sql: `CREATE TABLE IF NOT EXISTS public.categories (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
      });
      if (!error) console.log("✅ Categories tablosu oluşturuldu");
    }

    // 2. Products kontrol ve oluştur
    try {
      await supabase.from("products").select("id").limit(1);
      console.log("✅ Products tablosu zaten var");
    } catch {
      console.log("📝 Products tablosu oluşturuluyor...");
      const { error } = await supabase.rpc("exec_sql", {
        sql: `CREATE TABLE IF NOT EXISTS public.products (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
          sale_price NUMERIC(10, 2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
      });
      if (!error) console.log("✅ Products tablosu oluşturuldu");
    }

    // 3. Sales kontrol ve oluştur
    try {
      await supabase.from("sales").select("id").limit(1);
      console.log("✅ Sales tablosu zaten var");
    } catch {
      console.log("📝 Sales tablosu oluşturuluyor...");
      const { error } = await supabase.rpc("exec_sql", {
        sql: `CREATE TABLE IF NOT EXISTS public.sales (
          id BIGSERIAL PRIMARY KEY,
          product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL DEFAULT 1,
          sale_price NUMERIC(10, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
      });
      if (!error) console.log("✅ Sales tablosu oluşturuldu");
    }

    // 4. Örnek kategoriler ekle
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (!existingCategories || existingCategories.length === 0) {
      const { data, error } = await supabase
        .from("categories")
        .insert([
          { name: "Kahvaltı" },
          { name: "Nargile" },
          { name: "İçecekler" },
          { name: "Atıştırmalıklar" },
        ])
        .select();

      if (!error && data) {
        console.log("✅ Örnek kategoriler eklendi:", data.length);
      }
    }

    // 5. Örnek ürünler ekle
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (!existingProducts || existingProducts.length === 0) {
      // Önce kategorileri getir
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name");

      const categoryMap: { [key: string]: string } = {};
      cats?.forEach((cat: any) => {
        categoryMap[cat.name] = cat.id;
      });

      const { data: products, error } = await supabase
        .from("products")
        .insert([
          {
            name: "Serpme Kahvaltı",
            category_id: categoryMap["Kahvaltı"],
            sale_price: 75,
          },
          {
            name: "Tam Kahvaltı",
            category_id: categoryMap["Kahvaltı"],
            sale_price: 120,
          },
          {
            name: "Nargile (Su)",
            category_id: categoryMap["Nargile"],
            sale_price: 45,
          },
          {
            name: "Nargile (Meyveli)",
            category_id: categoryMap["Nargile"],
            sale_price: 55,
          },
          {
            name: "Türk Kahvesi",
            category_id: categoryMap["İçecekler"],
            sale_price: 25,
          },
          {
            name: "Çay",
            category_id: categoryMap["İçecekler"],
            sale_price: 15,
          },
        ])
        .select();

      if (!error && products) {
        console.log("✅ Örnek ürünler eklendi:", products.length);
      }
    }

    // 6. Örnek satış verisi ekle
    const { data: existingSales } = await supabase
      .from("sales")
      .select("id")
      .limit(1);

    if (!existingSales || existingSales.length === 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, sale_price");

      if (products && products.length > 0) {
        const salesData = [];
        const today = new Date();

        // Son 30 gün için rastgele satış ekle
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);

          for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
            const product =
              products[Math.floor(Math.random() * products.length)];
            salesData.push({
              product_id: product.id,
              quantity: Math.floor(Math.random() * 5) + 1,
              sale_price: product.sale_price,
              created_at: date.toISOString(),
            });
          }
        }

        const { data: inserted, error } = await supabase
          .from("sales")
          .insert(salesData)
          .select();

        if (!error && inserted) {
          console.log("✅ Örnek satış verileri eklendi:", inserted.length);
        }
      }
    }

    return NextResponse.json(
      {
        message: "✅ Veritabanı başlatıldı!",
        status: "ready",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Init hatası:", error);
    return NextResponse.json(
      { error: error.message, message: "Tabloları kontrol etsem de veri eklendi" },
      { status: 200 }
    );
  }
}
