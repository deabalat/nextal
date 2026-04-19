"use client";

import { useEffect, useState } from "react";

interface SaleDetail {
  date: string;
  product_id: string;
  product_name: string;
  quantity: number;
  revenue: number;
  material_cost: number;
  profit: number;
  profit_margin: string;
}

interface DiscrepancyItem {
  ingredient_id: string;
  expected_quantity: number;
  actual_quantity: number;
  discrepancy: number;
  unit_price: number;
  discrepancy_value: number;
}

interface ReportData {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_sales_amount: string;
    total_material_cost: string;
    total_profit: string;
    profit_margin: string;
  };
  sales_details: SaleDetail[];
  material_discrepancy: {
    total_loss_value: string;
    details: DiscrepancyItem[];
  };
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Date filter
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!startDate || !endDate) {
      setError("Başlangıç ve bitiş tarihi seç");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Başlangıç tarihi bitiş tarihinden önce olmalı");
      return;
    }

    setLoading(true);

    try {
      const url = `/api/reports?start_date=${startDate}&end_date=${endDate}`;
      console.log("📊 Rapor isteği gönderiliyor:", url);

      const res = await fetch(url);

      console.log("API Yanıtı:", res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Rapor oluşturulamadı");
      }

      const data = await res.json();
      console.log("✅ Rapor verisi alındı:", data);
      
      if (!data.sales_details || data.sales_details.length === 0) {
        setError("⚠️ Seçilen tarih aralığında satış verisi yok. Lütfen satış verisinin olduğu tarihleri seçin.");
      }
      
      setReport(data);
    } catch (error: any) {
      console.error("Rapor hatası:", error);
      setError(`❌ Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📈 Kar-Zarar Raporu</h1>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tarih Filtreleme */}
      <form
        onSubmit={handleGenerateReport}
        className="bg-white p-6 rounded-lg shadow space-y-4"
      >
        <h2 className="text-xl font-semibold">Rapor Parametreleri</h2>

        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Başlangıç Tarihi *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Bitiş Tarihi *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold"
          >
            {loading ? "Oluşturuluyor..." : "📊 Rapor Oluştur"}
          </button>
        </div>
      </form>

      {/* Rapor Özeti */}
      {report && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Toplam Satış Tutarı</p>
              <p className="text-3xl font-bold text-green-600">
                ₺{report.summary.total_sales_amount}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Toplam Malzeme Maliyeti</p>
              <p className="text-3xl font-bold text-red-600">
                ₺{report.summary.total_material_cost}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Net Kar</p>
              <p className="text-3xl font-bold text-blue-600">
                ₺{report.summary.total_profit}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Kar Marjı</p>
              <p className="text-3xl font-bold text-purple-600">
                {report.summary.profit_margin}
              </p>
            </div>
          </div>

          {/* Malzeme Kaybı Analizi */}
          {report.material_discrepancy.details.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                ⚠️ Malzeme Kaybı / Uyuşmazlık
              </h2>

              <p className="text-lg font-bold text-red-600 mb-4">
                Toplam Kayıp Değeri: ₺
                {report.material_discrepancy.total_loss_value}
              </p>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-red-200">
                    <th className="border p-2 text-left">Malzeme</th>
                    <th className="border p-2 text-right">Beklenen Stok</th>
                    <th className="border p-2 text-right">Fiili Stok</th>
                    <th className="border p-2 text-right">Kayıp Mikt.</th>
                    <th className="border p-2 text-right">Birim Fiyat</th>
                    <th className="border p-2 text-right">Kayıp Değeri</th>
                  </tr>
                </thead>
                <tbody>
                  {report.material_discrepancy.details.map((item) => (
                    <tr key={item.ingredient_id} className="hover:bg-red-100">
                      <td className="border p-2">{item.ingredient_id}</td>
                      <td className="border p-2 text-right">
                        {item.expected_quantity.toFixed(2)}
                      </td>
                      <td className="border p-2 text-right">
                        {item.actual_quantity.toFixed(2)}
                      </td>
                      <td className="border p-2 text-right font-bold">
                        {item.discrepancy.toFixed(2)}
                      </td>
                      <td className="border p-2 text-right">
                        ₺{item.unit_price.toFixed(2)}
                      </td>
                      <td className="border p-2 text-right font-bold text-red-600">
                        ₺{item.discrepancy_value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Satış Detayları */}
          {report.sales_details.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-xl font-semibold">Satış Detayları</h2>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tarih</th>
                    <th className="border p-2 text-left">Ürün</th>
                    <th className="border p-2 text-right">Miktar</th>
                    <th className="border p-2 text-right">Satış Geliri</th>
                    <th className="border p-2 text-right">Malzeme Maliyeti</th>
                    <th className="border p-2 text-right">Kar</th>
                    <th className="border p-2 text-right">Kar Marjı</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sales_details.map((sale, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-2">
                        {new Date(sale.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="border p-2">{sale.product_name}</td>
                      <td className="border p-2 text-right">{sale.quantity}</td>
                      <td className="border p-2 text-right">
                        ₺{sale.revenue.toFixed(2)}
                      </td>
                      <td className="border p-2 text-right">
                        ₺{sale.material_cost.toFixed(2)}
                      </td>
                      <td className="border p-2 text-right font-bold">
                        ₺{sale.profit.toFixed(2)}
                      </td>
                      <td className="border p-2 text-right">{sale.profit_margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.sales_details.length === 0 && (
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
              <p className="text-blue-800">
                Bu tarih aralığında satış verisi yok.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
