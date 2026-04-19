"use client";

import { useEffect, useState } from "react";

interface InventoryItem {
  id: string;
  ingredient_id: string;
  quantity: number;
  last_updated: string;
  recipes: {
    ingredient_name: string;
    unit_price: number;
  };
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Physical count state
  const [physicalData, setPhysicalData] = useState({
    ingredient_id: "",
    physical_count: 0,
    notes: "",
  });

  // Malzeme Ekleme State
  const [newIngredient, setNewIngredient] = useState({
    ingredient_name: "",
    quantity: 0,
    unit_price: 0,
  });

  const loadInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setInventory(data);
      } else {
        setInventory([]);
        console.error("API döndürdü: array olmayan data", data);
      }
    } catch (error) {
      console.error("Inventory yükleme hatası:", error);
      setInventory([]);
    }
  };

  // Malzeme Ekleme Handler
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIngredient.ingredient_name.trim() || newIngredient.quantity <= 0) {
      alert("Malzeme adı ve miktarı gerekli");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/inventory/add-ingredient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIngredient),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      alert("✅ Malzeme eklendi!");
      setNewIngredient({ ingredient_name: "", quantity: 0, unit_price: 0 });
      loadInventory();
    } catch (error: any) {
      alert(`❌ Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handlePhysicalCount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!physicalData.ingredient_id || physicalData.physical_count < 0) {
      alert("Malzeme seçimi ve geçerli sayım gerekli");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(physicalData),
      });

      if (!res.ok) throw new Error("Fiziksel sayım güncellemesi başarısız");

      const result = await res.json();

      if (result.discrepancy > 0) {
        alert(
          `⚠️  Uyuşmazlık Tespit Edildi!\n` +
          `Beklenen: ${result.expectedQuantity}\n` +
          `Fiili: ${result.physicalCount}\n` +
          `Kayıp: ${result.discrepancy}`
        );
      } else if (result.discrepancy < 0) {
        alert(
          `✅ Fazlalık Tespit Edildi!\n` +
          `Beklenen: ${result.expectedQuantity}\n` +
          `Fiili: ${result.physicalCount}\n` +
          `Fazla: ${Math.abs(result.discrepancy)}`
        );
      } else {
        alert("✅ Stok eşitleme başarılı!");
      }

      setPhysicalData({ ingredient_id: "", physical_count: 0, notes: "" });
      setEditingId(null);
      loadInventory();
    } catch (error: any) {
      alert(`❌ Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = editingId
    ? inventory.find((i) => i.ingredient_id === editingId)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Stok Yönetimi</h1>

      {/* Fiziksel Sayım Formu */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? "Fiziksel Sayım Güncelle" : "Fiziksel Sayım Giriş"}
        </h2>

        <form onSubmit={handlePhysicalCount} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Malzeme *
              </label>
              <select
                required
                value={physicalData.ingredient_id}
                onChange={(e) => {
                  const selection = e.target.value;
                  setEditingId(selection);
                  setPhysicalData({
                    ...physicalData,
                    ingredient_id: selection,
                  });
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Malzeme Seçin --</option>
                {inventory.map((item) => (
                  <option key={item.ingredient_id} value={item.ingredient_id}>
                    {item.recipes?.ingredient_name} (Beklenen:{" "}
                    {item.quantity.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Fiziksel Sayım (Miktar) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={physicalData.physical_count || ""}
                onChange={(e) =>
                  setPhysicalData({
                    ...physicalData,
                    physical_count: parseFloat(e.target.value) || 0,
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
                placeholder="Opsiyonel notlar"
                value={physicalData.notes}
                onChange={(e) =>
                  setPhysicalData({
                    ...physicalData,
                    notes: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Kaydediliyor..." : "✅ Sayımı Kaydet"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setPhysicalData({
                    ingredient_id: "",
                    physical_count: 0,
                    notes: "",
                  });
                }}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                İptal
              </button>
            )}
          </div>
        </form>

        {selectedItem && (
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
            <p className="text-sm">
              <strong>{selectedItem.recipes?.ingredient_name}</strong>
            </p>
            <p className="text-xs text-gray-600">
              Beklenen Stok: {selectedItem.quantity.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">
              Son Güncelleme:{" "}
              {new Date(selectedItem.last_updated).toLocaleDateString("tr-TR")}
            </p>
          </div>
        )}
      </div>

      {/* Yeni Malzeme Ekleme Formu */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">➕ Yeni Malzeme Ekle</h2>

        <form onSubmit={handleAddIngredient} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Malzeme Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Malzeme adını girin"
                value={newIngredient.ingredient_name}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    ingredient_name: e.target.value,
                  })
                }
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                İlk Miktar (kg/L/adet) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={newIngredient.quantity || ""}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Birim Fiyat (₺) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={newIngredient.unit_price || ""}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    unit_price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? "Ekleniyor..." : "✅ Malzemeyi Ekle"}
          </button>
        </form>
      </div>

      {/* Stok Listesi */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">
          Malzeme Stok Seviyeleri ({inventory.length})
        </h2>

        {inventory.length === 0 ? (
          <p className="text-gray-500">Henüz stok kaydı yok.</p>
        ) : (
          <div className="space-y-2">
            {inventory.map((item) => {
              // Fiyat hesapla
              const stockValue = (
                (item.quantity || 0) * (item.recipes?.unit_price || 0)
              ).toFixed(2);

              return (
                <div
                  key={item.ingredient_id}
                  className="border p-4 rounded hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">
                        {item.recipes?.ingredient_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Stok: {item.quantity.toFixed(2)} | Birim Fiyat: ₺
                        {(item.recipes?.unit_price || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Stok Değeri: ₺{stockValue}
                      </p>
                      <p className="text-xs text-gray-500">
                        Son Güncellenme:{" "}
                        {new Date(item.last_updated).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingId(item.ingredient_id);
                        setPhysicalData({
                          ingredient_id: item.ingredient_id,
                          physical_count: item.quantity,
                          notes: "",
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Sayımı Düzenle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
