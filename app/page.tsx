"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Page() {

  const [products, setProducts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [ingredientName, setIngredientName] = useState("");
  const [gram, setGram] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);

  const [saleQty, setSaleQty] = useState(1);
  const [salePrice, setSalePrice] = useState(0);

  async function loadData() {
    const { data: p } = await supabase.from("products").select("*");
    const { data: r } = await supabase.from("recipes").select("*");
    const { data: c } = await supabase.from("categories").select("*");
    const { data: s } = await supabase.from("sales").select("*");

    setProducts(p || []);
    setRecipes(r || []);
    setCategories(c || []);
    setSales(s || []);
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (selectedProduct) {
      setSalePrice(selectedProduct.sale_price || 0);
    }
  }, [selectedProduct]);

  // CATEGORY
  async function addCategory() {
    if (!newCategoryName.trim()) return;
    await supabase.from("categories").insert({ name: newCategoryName });
    setNewCategoryName("");
    loadData();
  }

  async function deleteCategory(id: string) {
    const hasProducts = products.some(p => p.category_id === id);
    if (hasProducts) {
      alert("Bu kategoride ürün var, önce ürünleri sil.");
      return;
    }

    await supabase.from("categories").delete().eq("id", id);
    loadData();
  }

  async function updateCategory(id: string) {
    await supabase.from("categories").update({ name: editingCategoryName }).eq("id", id);
    setEditingCategoryId(null);
    loadData();
  }

  // PRODUCT
  async function addProduct() {
    if (!newProductName.trim()) return;

    await supabase.from("products").insert({
      name: newProductName,
      category_id: selectedCategory || null,
      sale_price: newProductPrice,
    });

    setNewProductName("");
    setNewProductPrice(0);
    loadData();
  }

  async function deleteProduct(id: string) {
    await supabase.from("recipes").delete().eq("product_id", id);
    await supabase.from("sales").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);

    loadData();
    setSelectedProduct(null);
  }

  async function updateProductPrice(id: string, price: number) {
    await supabase.from("products").update({ sale_price: price }).eq("id", id);
    loadData();
  }

  // RECIPE
  async function addRecipe() {
    if (!selectedProduct || !ingredientName || gram <= 0) return;

    await supabase.from("recipes").insert({
      product_id: selectedProduct.id,
      ingredient_name: ingredientName,
      gram,
      unit_price: unitPrice,
    });

    setIngredientName("");
    setGram(0);
    setUnitPrice(0);
    loadData();
  }

  async function deleteRecipe(id: string) {
    await supabase.from("recipes").delete().eq("id", id);
    loadData();
  }

  // 🔥 EKLENDİ: RECIPE UPDATE
  async function updateRecipe(id: string, field: string, value: number) {
    await supabase
      .from("recipes")
      .update({ [field]: value })
      .eq("id", id);

    loadData();
  }

  async function makeSale() {
  if (!selectedProduct || saleQty <= 0) return;

  await supabase.from("sales").insert({
    product_id: selectedProduct.id,
    quantity: saleQty,
    sale_price: salePrice,
    created_at: new Date().toISOString(),
  });

    loadData();
  }

  function calculateCost(productId: string) {
    return recipes
      .filter(r => r.product_id === productId)
      .reduce((sum, r) => sum + (r.gram / 1000) * r.unit_price, 0);
  }

  function calculateTotalProfit(productId: string) {
    const unitCost = calculateCost(productId);

    const productSales = sales.filter(s => s.product_id === productId);

    let total = 0;

    for (const s of productSales) {
      const revenue = s.sale_price * s.quantity;
      const cost = unitCost * s.quantity;
      total += revenue - cost;
    }

    return total;
  }

  function getSuggestion(product: any) {
  const cost = calculateCost(product.id);
  const profit = product.sale_price - cost;

  if (profit < 0) {
    return "❌ Zarar ediyor → fiyatı artır veya kaldır";
  }

  if (profit < 20) {
    return "⚠️ Kar düşük → maliyet düşür veya fiyat artır";
  }

  if (profit > 50) {
    return "🔥 Çok iyi → öne çıkar";
  }

  return "✅ Normal";
}

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="min-h-screen flex bg-gray-100">

      <div className="w-64 bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-6">Nextal</h1>

        <button onClick={() => setActiveCategory(null)} className="mb-2">
          Tümü
        </button>

        {categories.map(c => (
          <div key={c.id} className="flex justify-between items-center mb-2">

            {editingCategoryId === c.id ? (
              <>
                <input
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  className="text-black p-1 w-full"
                />
                <button onClick={() => updateCategory(c.id)}>✔</button>
              </>
            ) : (
              <>
                <span onClick={() => setActiveCategory(c.id)} className="cursor-pointer">
                  {c.name}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => {
                    setEditingCategoryId(c.id);
                    setEditingCategoryName(c.name);
                  }}>✏</button>
                  <button onClick={() => deleteCategory(c.id)}>🗑</button>
                </div>
              </>
            )}

          </div>
        ))}
      </div>

      <div className="flex-1 p-10">

        <h2 className="text-3xl font-bold mb-6">Ürün Yönetimi</h2>

        <div className="flex gap-2 mb-4">
          <input
            placeholder="Kategori"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="border p-2 rounded w-60"
          />
          <button className="bg-black text-white px-4 py-2 rounded-lg" onClick={addCategory}>
            Ekle
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            placeholder="Ürün"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Satış fiyatı"
            value={newProductPrice}
            onChange={(e) => setNewProductPrice(Number(e.target.value))}
            className="border p-2 rounded w-40"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button className="bg-black text-white px-4 py-2 rounded-lg" onClick={addProduct}>
            Ekle
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {filteredProducts.map(p => {

            const cost = calculateCost(p.id);
            const profit = p.sale_price - cost;
            const totalProfit = calculateTotalProfit(p.id);

            return (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl shadow cursor-pointer hover:scale-[1.02] transition"
                onClick={() => setSelectedProduct(p)}
              >
                <h3 className="font-semibold mb-2">
                  {p.name} - {p.sale_price} TL
                </h3>

                <input
                  type="number"
                  value={p.sale_price}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateProductPrice(p.id, Number(e.target.value))}
                  className="border p-1 rounded w-full mb-2"
                />

                <p className="text-sm text-gray-500">
                  Maliyet: {cost.toFixed(2)} TL
                </p>

                <p className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  Birim Kar: {profit.toFixed(2)} TL
                </p>

                <p className={`font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  Toplam Kar: {totalProfit.toFixed(2)} TL
                </p>

                <p className="text-xs mt-2 text-gray-600">
  {getSuggestion(p)}
</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProduct(p.id);
                  }}
                  className="text-red-500 text-sm mt-2"
                >
                  Sil
                </button>

              </div>
            );
          })}

        </div>

        {selectedProduct && (
          <div className="mt-8 bg-white p-6 rounded-2xl shadow">

            <h2 className="text-xl font-bold mb-4">
              {selectedProduct.name}
            </h2>

            <div className="grid grid-cols-4 gap-2 mb-4">

              <input placeholder="Malzeme" value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} className="border p-2 rounded"/>
              <input type="number" placeholder="Gram" value={gram} onChange={(e) => setGram(Number(e.target.value))} className="border p-2 rounded"/>
              <input type="number" placeholder="Kg fiyat" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="border p-2 rounded"/>

              <button onClick={addRecipe} className="bg-black text-white rounded">
                Ekle
              </button>

            </div>

            {recipes.filter(r => r.product_id === selectedProduct.id).map(r => (
              <div key={r.id} className="flex justify-between items-center border-b py-2">
                <span>{r.ingredient_name}</span>

                {/* 🔥 EDITABLE GRAM */}
                <input
                  type="number"
                  value={r.gram}
                  onChange={(e) => updateRecipe(r.id, "gram", Number(e.target.value))}
                  className="border p-1 w-20"
                />

                {/* 🔥 EDITABLE PRICE */}
                <input
                  type="number"
                  value={r.unit_price}
                  onChange={(e) => updateRecipe(r.id, "unit_price", Number(e.target.value))}
                  className="border p-1 w-24"
                />

                <span>{((r.gram / 1000) * r.unit_price).toFixed(2)} TL</span>

                <button onClick={() => deleteRecipe(r.id)} className="text-red-500">Sil</button>
              </div>
            ))}

            {(() => {
              const unitCost = calculateCost(selectedProduct.id);
              const totalCost = unitCost * saleQty;
              const totalRevenue = salePrice * saleQty;
              const profit = totalRevenue - totalCost;

              return (
                <div className="mt-4 space-y-1">
                  <div>Birim Maliyet: {unitCost.toFixed(2)} TL</div>
                  <div>Ciro: {totalRevenue.toFixed(2)} TL</div>
                  <div>Maliyet: {totalCost.toFixed(2)} TL</div>
                  <div className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                    Kar: {profit.toFixed(2)} TL
                  </div>
                </div>
              );
            })()}

            <div className="mt-4 flex gap-2">
              <input type="number" value={saleQty} onChange={(e) => setSaleQty(Number(e.target.value))} className="border p-2 w-20 rounded"/>
              <input type="number" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} className="border p-2 w-24 rounded"/>

              <button onClick={makeSale} className="bg-green-600 text-white px-5 py-2 rounded-lg">
                Satış Yap
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
