import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST: Örnek satış verisi ekle (TEST için)
export async function POST(req: NextRequest) {
  try {
    // Önce products tablosundan ürünleri getir
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, name, sale_price");

    if (prodError || !products || products.length === 0) {
      return NextResponse.json(
        { error: "Ürün bulunamadı. Lütfen önce ürün ekleyin." },
        { status: 400 }
      );
    }

    // Son 30 gün için örnek satış verileri ekle
    const salesData = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Random ürün seç
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      // Random sayı (1-5 adet)
      const quantity = Math.floor(Math.random() * 5) + 1;

      salesData.push({
        product_id: randomProduct.id,
        quantity,
        sale_price: randomProduct.sale_price || 50,
        created_at: date.toISOString(),
      });
    }

    // Satış verilerini ekle
    const { data: inserted, error: insertError } = await supabase
      .from("sales")
      .insert(salesData)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json(
      {
        message: `✅ ${inserted?.length || 0} adet örnek satış verisi eklendi`,
        data: inserted,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sample data hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
