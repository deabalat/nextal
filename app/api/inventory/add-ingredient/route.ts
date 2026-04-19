import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST: Yeni malzeme ekle (stok sayfasından)
export async function POST(req: NextRequest) {
  try {
    const { ingredient_name, quantity, unit_price } = await req.json();

    if (!ingredient_name?.trim() || quantity <= 0) {
      return NextResponse.json(
        { error: "Malzeme adı ve miktarı gerekli" },
        { status: 400 }
      );
    }

    // Recipes tablosuna ekle
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        ingredient_name: ingredient_name.trim(),
        unit_price: unit_price || 0,
      })
      .select();

    if (recipeError) throw recipeError;

    const recipe_id = recipeData?.[0]?.id;

    if (!recipe_id) {
      throw new Error("Malzeme ID alınamadı");
    }

    // Inventory tablosuna ekle
    const { data: invData, error: invError } = await supabase
      .from("inventory")
      .insert({
        ingredient_id: recipe_id,
        quantity: quantity,
        last_updated: new Date().toISOString(),
      })
      .select();

    if (invError) throw invError;

    return NextResponse.json(
      {
        message: "✅ Malzeme başarıyla eklendi",
        recipe: recipeData[0],
        inventory: invData[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Malzeme ekleme hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
