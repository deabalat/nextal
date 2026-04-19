import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// DELETE: Fatura sil (Inventory'i ters işlem yap)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Faturayı getir (invoice items için)
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("id", id);

    if (!invoiceData?.length) {
      return NextResponse.json(
        { error: "Fatura bulunamadı" },
        { status: 404 }
      );
    }

    const invoice = invoiceData[0];

    // Her item için inventory'i azalt
    for (const item of invoice.invoice_items || []) {
      const { data: inventoryData } = await supabase
        .from("inventory")
        .select("*")
        .eq("ingredient_id", item.ingredient_id);

      if (inventoryData?.length) {
        const currentQty = inventoryData[0].quantity;
        await supabase
          .from("inventory")
          .update({ quantity: Math.max(0, currentQty - item.quantity) })
          .eq("ingredient_id", item.ingredient_id);
      }
    }

    // Fatura sil (cascade: invoice_items otomatik silinecek)
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
