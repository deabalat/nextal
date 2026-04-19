"use client";

import { useEffect, useState } from "react";

interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuppliers(data);
      } else {
        setSuppliers([]);
        console.error("API döndürdü: array olmayan data", data);
      }
    } catch (error) {
      console.error("Suppliers yükleme hatası:", error);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Güncelle
        const res = await fetch(`/api/suppliers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Güncelleme başarısız");
        alert("✅ Tedarikçi güncellendi");
        setEditingId(null);
      } else {
        // Ekle
        const res = await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Ekleme başarısız");
        alert("✅ Tedarikçi eklendi");
      }

      setFormData({ name: "", phone: "", email: "", address: "" });
      loadSuppliers();
    } catch (error: any) {
      alert(`❌ Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tedarikçiyi silmek istiyor musun?")) return;

    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      alert("✅ Tedarikçi silindi");
      loadSuppliers();
    } catch (error: any) {
      alert(`❌ Hata: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📦 Tedarikçi Yönetimi</h1>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Tedarikçi Düzenle" : "Yeni Tedarikçi Ekle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tedarikçi Adı *"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full p-2 border rounded"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Telefon"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="p-2 border rounded"
            />
          </div>

          <input
            type="text"
            placeholder="Adres"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", phone: "", email: "", address: "" });
                }}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tedarikçiler Listesi */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Tedarikçiler ({suppliers.length})
        </h2>

        {suppliers.length === 0 ? (
          <p className="text-gray-500">Henüz tedarikçi eklemedim.</p>
        ) : (
          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="border p-4 rounded hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{supplier.name}</h3>
                    {supplier.phone && <p className="text-sm">📞 {supplier.phone}</p>}
                    {supplier.email && <p className="text-sm">📧 {supplier.email}</p>}
                    {supplier.address && <p className="text-sm">📍 {supplier.address}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
