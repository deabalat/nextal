import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET: Tüm faturaları getir (filter ve joins ile supplier bilgisi dahil)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const supplierId = searchParams.get("supplier_id");

    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        suppliers ( id, name ),
        invoice_items ( id, ingredient_id, quantity, unit_price )
      `
      )
      .order("invoice_date", { ascending: false });

    if (supplierId) {
      query = query.eq("supplier_id", supplierId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Yeni fatura ekle (+ Inventory otomatik güncelleme)
export async function POST(req: NextRequest) {
  try {
    const {
      supplier_id,
      invoice_number,
      invoice_date,
      total_amount,
      notes,
      items,
    } = await req.json();

    // Validasyon
    if (!supplier_id || !invoice_number || !invoice_date) {
      return NextResponse.json(
        { error: "Tedarikçi, fatura no ve tarih gerekli" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Faturada en az 1 malzeme olması gerekli" },
        { status: 400 }
      );
    }

    // Fatura number benzersiz mi kontrol et
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("invoice_number", invoice_number);

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Bu fatura numarası zaten var" },
        { status: 400 }
      );
    }

    // Fatura oluştur
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        supplier_id,
        invoice_number,
        invoice_date,
        total_amount,
        notes,
      })
      .select();

    if (invoiceError) throw invoiceError;

    const invoiceId = invoiceData[0].id;

    // Fatura detaylarını ekle ve Inventory'i güncelle
    for (const item of items) {
      const { ingredient_id, quantity, unit_price } = item;

      // Invoice item ekle
      const { error: itemError } = await supabase
        .from("invoice_items")
        .insert({
          invoice_id: invoiceId,
          ingredient_id,
          quantity,
          unit_price,
        });

      if (itemError) throw itemError;

      // Inventory'i güncelle (stok artır)
      const { data: inventoryData } = await supabase
        .from("inventory")
        .select("*")
        .eq("ingredient_id", ingredient_id);

      if (inventoryData && inventoryData.length > 0) {
        // Mevcut inventory'i güncelle
        const currentQty = inventoryData[0].quantity;
        await supabase
          .from("inventory")
          .update({ quantity: currentQty + quantity })
          .eq("ingredient_id", ingredient_id);
      } else {
        // Yeni inventory kaydı oluştur
        await supabase.from("inventory").insert({
          ingredient_id,
          quantity,
        });
      }

      // Price History'ye kaydet (malzeme fiyatı değişti mi kontrol et)
      const { data: recipeData } = await supabase
        .from("recipes")
        .select("unit_price")
        .eq("id", ingredient_id);

      if (recipeData && recipeData.length > 0) {
        const oldPrice = recipeData[0].unit_price;

        // Fiyat değiştiyse history'ye kaydet
        if (oldPrice !== unit_price) {
          await supabase.from("price_history").insert({
            ingredient_id,
            old_price: oldPrice,
            new_price: unit_price,
          });

          // Recipes tablosunda fiyatı güncelle (ortalama al)
          await supabase
            .from("recipes")
            .update({
              unit_price,
            })
            .eq("id", ingredient_id);
        }
      }
    }

    // Fatura full data ile döndür
    const { data: fullInvoice } = await supabase
      .from("invoices")
      .select(
        `
        *,
        suppliers ( id, name ),
        invoice_items ( id, ingredient_id, quantity, unit_price )
      `
      )
      .eq("id", invoiceId);

    return NextResponse.json(fullInvoice?.[0], { status: 201 });
  } catch (error: any) {
    console.error("Invoice creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
