import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET: Tüm tedarikçileri getir
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("API Error Details:", error);
    return NextResponse.json({ 
      error: error.message,
      details: error.details || error.hint || "Bilinmeyen hata"
    }, { status: 500 });
  }
}

// POST: Yeni tedarikçi ekle
export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, address } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Tedarikçi adı gerekli" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("suppliers")
      .insert({ name, phone, email, address })
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
