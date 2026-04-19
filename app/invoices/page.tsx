"use client";

import { useEffect, useState } from "react";

interface Recipe {
  id: string;
  ingredient_name: string;
  unit_price: number;
  product_id: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface InvoiceItem {
  ingredient_id: string;
  quantity: number;
  unit_price: number;
  ingredient_name?: string;
}

export default function InvoicesPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    supplier_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    total_amount: 0,
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({
    ingredient_id: "",
    quantity: 0,
    unit_price: 0,
  });

  const loadData = async () => {
    try {
      const [suppRes, recipesRes] = await Promise.all([
        fetch("/api/suppliers"),
        fetch("/api/recipes"),
      ]);

      if (!suppRes.ok || !recipesRes.ok) {
        throw new Error("API request başarısız");
      }

      const suppliers = await suppRes.json();
      const recipes = await recipesRes.json();

      setSuppliers(Array.isArray(suppliers) ? suppliers : []);
      setRecipes(Array.isArray(recipes) ? recipes : []);
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
      setSuppliers([]);
      setRecipes([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Malzeme ekle
  const handleAddItem = () => {
    if (!newItem.ingredient_id || newItem.quantity <= 0) {
      alert("Malzeme ve miktar gerekli");
      return;
    }

    const recipe = recipes.find((r) => r.id === newItem.ingredient_id);
    const item: InvoiceItem = {
      ...newItem,
      ingredient_name: recipe?.ingredient_name,
    };

    setItems([...items, item]);
    setNewItem({ ingredient_id: "", quantity: 0, unit_price: 0 });
  };

  // Malzeme sil
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Fatura gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Faturada en az 1 malzeme olması gerekli");
      return;
    }

    if (!formData.supplier_id) {
      alert("Tedarikçi seçimi gerekli");
      return;
    }

    setLoading(true);

    try {
      const invoiceData = {
        ...formData,
        total_amount: items.reduce((sum, item) => 
          sum + (item.quantity * item.unit_price), 0
        ),
        items,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      alert("✅ Fatura kaydedildi!");

      // Reset form
      setFormData({
        supplier_id: "",
        invoice_number: "",
        invoice_date: new Date().toISOString().split("T")[0],
        total_amount: 0,
        notes: "",
      });
      setItems([]);
    } catch (error: any) {
      alert(`❌ Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => 
    sum + (item.quantity * item.unit_price), 0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📄 Fatura Giriş</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fatura Bilgisi */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Fatura Bilgisi</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tedarikçi *
              </label>
              <select
                required
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="">-- Tedarikçi Seçin --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Fatura No *
              </label>
              <input
                type="text"
                required
                placeholder="F-2024-001"
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoice_number: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Fatura Tarihi *
              </label>
              <input
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoice_date: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Notlar
              </label>
              <input
                type="text"
                placeholder="Fazladan notlar (opsiyonel)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Malzeme Ekleme */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Malzeme Ekle</h2>

          <div className="grid grid-cols-4 gap-2 items-end">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Malzeme *
              </label>
              <select
                value={newItem.ingredient_id}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    ingredient_id: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">-- Malzeme Seçin --</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.ingredient_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Miktar *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newItem.quantity || ""}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Fiyat *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newItem.unit_price || ""}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    unit_price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Ekle
            </button>
          </div>
        </div>

        {/* Malzemeler Listesi */}
        {items.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold">Fatura Detayları</h2>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Malzeme</th>
                  <th className="border p-2 text-right">Miktar</th>
                  <th className="border p-2 text-right">Birim Fiyat</th>
                  <th className="border p-2 text-right">Toplam</th>
                  <th className="border p-2 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-2">{item.ingredient_name}</td>
                    <td className="border p-2 text-right">{item.quantity.toFixed(2)}</td>
                    <td className="border p-2 text-right">
                      ₺{item.unit_price.toFixed(2)}
                    </td>
                    <td className="border p-2 text-right font-bold">
                      ₺{(item.quantity * item.unit_price).toFixed(2)}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={3} className="border p-2 text-right">
                    TOPLAM:
                  </td>
                  <td className="border p-2 text-right">
                    ₺{totalAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 font-bold"
              >
                {loading ? "Kaydediliyor..." : "✅ Faturayı Kaydet"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
