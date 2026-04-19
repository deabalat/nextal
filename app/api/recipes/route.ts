import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET: Tüm recipes (malzeme/tarif listesi)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("ingredient_name");

    if (error) {
      console.error("Recipes Supabase Error:", error);
      throw error;
    }
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Recipes API Error:", error);
    return NextResponse.json({ 
      error: error.message,
      details: error.details || "Bilinmeyen hata"
    }, { status: 500 });
  }
}
