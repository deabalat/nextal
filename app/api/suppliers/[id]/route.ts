import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// PUT: Tedarikçi güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, phone, email, address } = await req.json();

    const { data, error } = await supabase
      .from("suppliers")
      .update({ name, phone, email, address })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data?.length) {
      return NextResponse.json(
        { error: "Tedarikçi bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Tedarikçi sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Tedarikçinin faturası var mı kontrol et
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("supplier_id", id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Bu tedarikçinin faturası var, silemezsin" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
