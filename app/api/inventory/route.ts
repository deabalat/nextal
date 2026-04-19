import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET: Tüm inventory (malzeme stok seviyeleri)
export async function GET() {
  try {
    // Inventory ve recipes'i ayrı getir, sonra birleştir
    const { data: inventoryData, error: invError } = await supabase
      .from("inventory")
      .select("id, ingredient_id, quantity, last_updated")
      .order("last_updated", { ascending: false });

    if (invError) throw invError;

    // Recipes bilgilerini getir
    const { data: recipesData, error: recError } = await supabase
      .from("recipes")
      .select("id, ingredient_name, unit_price");

    if (recError) throw recError;

    // Inventory ve recipes'i birleştir
    const recipesMap = new Map(recipesData?.map(r => [r.id, r]) ?? []);
    const combined = inventoryData?.map(inv => ({
      ...inv,
      recipes: recipesMap.get(inv.ingredient_id),
    })) ?? [];

    return NextResponse.json(combined);
  } catch (error: any) {
    console.error("Inventory GET hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Fiziksel sayım - inventory güncelle (expected vs actual comparison)
export async function PUT(req: NextRequest) {
  try {
    const { ingredient_id, physical_count, notes } = await req.json();

    if (!ingredient_id || physical_count === undefined) {
      return NextResponse.json(
        { error: "Malzeme ID ve fiziksel sayım gerekli" },
        { status: 400 }
      );
    }

    // Mevcut inventory getir
    const { data: inventoryData } = await supabase
      .from("inventory")
      .select("*")
      .eq("ingredient_id", ingredient_id);

    if (!inventoryData?.length) {
      return NextResponse.json(
        { error: "Inventory kaydı bulunamadı" },
        { status: 404 }
      );
    }

    const expectedQuantity = inventoryData[0].quantity;

    // Inventory güncelle
    const { data, error } = await supabase
      .from("inventory")
      .update({
        quantity: physical_count,
        last_updated: new Date().toISOString(),
      })
      .eq("ingredient_id", ingredient_id)
      .select();

    if (error) throw error;

    // Fark hesapla
    const discrepancy = expectedQuantity - physical_count;

    return NextResponse.json({
      ...data[0],
      expectedQuantity,
      physicalCount: physical_count,
      discrepancy, // Pozitif = kayıp, Negatif = fazlalık
      notes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
