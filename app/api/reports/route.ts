import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET: Kar-Zarar Raporu + Uyuşmazlık Analizi
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("start_date"); // YYYY-MM-DD
    const endDate = searchParams.get("end_date"); // YYYY-MM-DD

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Başlangıç ve bitiş tarihi gerekli (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    console.log(`📊 Rapor isteği: ${startDate} - ${endDate}`);

    // 1. Satış verilerini getir (dönem içinde)
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("id, product_id, quantity, sale_price, created_at, products(id, name, category_id, sale_price)")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`)
      .order("created_at", { ascending: false });

    if (salesError) {
      console.error("Sales veri hatası:", salesError);
      throw salesError;
    }

    console.log(`✅ ${salesData?.length || 0} adet satış bulundu`);

    // 2. Fatura verilerini getir (dönem içinde)
    const { data: invoicesData, error: invError } = await supabase
      .from("invoices")
      .select("id, supplier_id, invoice_date, total_amount, invoice_items(id, ingredient_id, quantity, unit_price)")
      .gte("invoice_date", startDate)
      .lte("invoice_date", endDate);

    if (invError) console.error("Invoice veri hatası:", invError);

    // Kar-zarar hesaplaması
    let totalSalesAmount = 0;
    let totalMaterialCost = 0;
    const saleDetails: any[] = [];

    // Her satış için karlılığı hesapla
    if (salesData && salesData.length > 0) {
      for (const sale of salesData) {
        const saleRevenueAmount = (sale.sale_price || 0) * (sale.quantity || 1);
        totalSalesAmount += saleRevenueAmount;

        // Malzeme maliyetini hesapla  
        let productMaterialCost = 0;

        // Bu ürünün malzemeleri getir (recipes)
        const { data: recipes, error: recError } = await supabase
          .from("recipes")
          .select("id, ingredient_name, gram, unit_price")
          .eq("product_id", sale.product_id);

        if (!recError && recipes) {
          for (const recipe of recipes) {
            const ingredientCost =
              ((recipe.gram || 0) / 1000) * (recipe.unit_price || 0); // kg başına fiyat
            productMaterialCost += ingredientCost;
          }
        }

        const saleProfit = saleRevenueAmount - productMaterialCost;
        totalMaterialCost += productMaterialCost;

        saleDetails.push({
          date: sale.created_at,
          product_id: sale.product_id,
          product_name: sale.products?.name || "Bilinmiyor",
          quantity: sale.quantity || 1,
          revenue: saleRevenueAmount,
          material_cost: productMaterialCost,
          profit: saleProfit,
          profit_margin: saleRevenueAmount > 0 
            ? ((saleProfit / saleRevenueAmount) * 100).toFixed(2) + "%"
            : "0%",
        });
      }
    }

    const totalProfit = totalSalesAmount - totalMaterialCost;
    const profitMargin =
      totalSalesAmount > 0
        ? ((totalProfit / totalSalesAmount) * 100).toFixed(2)
        : "0";

    return NextResponse.json({
      period: { start_date: startDate, end_date: endDate },
      summary: {
        total_sales_amount: totalSalesAmount.toFixed(2),
        total_material_cost: totalMaterialCost.toFixed(2),
        total_profit: totalProfit.toFixed(2),
        profit_margin: profitMargin + "%",
      },
      sales_details: saleDetails,
      material_discrepancy: {
        total_loss_value: "0",
        details: [],
        note: "Malzeme kaybı analizi Stok sayfasında fiziksel sayım yapıldığında gösterilir",
      },
    });
  } catch (error: any) {
    console.error("Report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
