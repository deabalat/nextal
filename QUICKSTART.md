# 🚀 Kafe Yönetim Sistemi - BAŞLANGIÇ REHBERİ

Tüm kod yazıldı! Şimdi tam işlevsel bir sistem var:
- ✅ Tedarikçi yönetimi
- ✅ Fatura giriş (malzeme stok otomatik güncelleme)
- ✅ Stok takibi + fiziksel sayım
- ✅ Kar-zarar raporu + malzeme kaybı analizi

---

## ⚡ HEMEN BAŞLANGIÇ (3 Adım)

### 1️⃣ Veritabanı Tablolarını Oluştur (Supabase)

1. [Supabase Dashboard](https://app.supabase.com) aç
2. Projenin seç
3. **SQL Editor** (Sol sidebar) tıkla
4. `migrations/001_create_tables.sql` dosyasının TÜMÜNÜ kopyala
5. SQL Editor'e YAPIŞTUR
6. **Execute** (Yeşil ► buton) tıkla

✅ Eğer "relation already exists" hatası alırsan → Normal! Tablolar var demek.

### 2️⃣ Environment Kontrolü

Dosya al: `.env.local` — Zaten var mı kontrol et

```bash
# Varsa bu satırları taşı:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

Yoksa `.env.example` dosyasını kopyalayıp:
1. `.env.local` olarak kaydet
2. Supabase Dashboard → Settings → API keys'ten değerleri doldur

### 3️⃣ Uygulamayı Başlat

```bash
npm run dev
```

Tarayıcı açılacak → `http://localhost:3000`

---

## 📱 SAYFA REHBERI

### 🎯 Dashboard (`/`)
**Ürün Yönetimi** (Mevcut ekran kalıyor)
- Kategori, Ürün, Malzeme (tarif), Satış kaydı

### 📦 Tedarikçiler (`/suppliers`)
**Tedarikçi Bilgileri**
1. Yeni tedarikçi ekle (ad, telefon, email, adres)
2. Tedarikçi listesini göster
3. Düzenle / Sil

### 📄 Faturalar (`/invoices`)  ⭐ **ÖNEMLİ**
**Fatura Giriş & Malzeme Stok Otomatik Güncelleme**
1. Tedarikçi seç
2. Fatura bilgisi (No, Tarih, Notlar)
3. Malzeme ekle:
   - Malzeme (recipes'den dropdown)
   - Miktar
   - Birim Fiyat
4. Preview (Toplam Tutar göster)
5. **Kaydet** → ✨ **Inventory otomatik güncellenir!**

### 📈 Stok (`/inventory`)
**Stok Seviyesi + Fiziksel Sayım**
1. Mevcut stok listesi (Beklenen Stok gösterir)
2. Fiziksel sayım yap:
   - Malzeme seç
   - Fiili miktarı gir (örn: 2.5 kg)
   - Sistem otomatik farkı gösterir:
     - ✅ Eşleşme (İdeal)
     - ❌ Kayıp (Malzeme kaybı tespit)
     - ⚠️ Fazlalık (Yanlış kayıt?)

### 💰 Raporlar (`/reports`)
**Kar-Zarar Analizi + Malzeme Kaybı**
1. Dönem seç (Başlangıç/Bitiş Tarihi)
2. Rapor Oluştur → Göreceksin:
   - 📊 Toplam Satış
   - 💸 Toplam Malzeme Maliyeti
   - 💎 Net Kar
   - 📈 Kar Marjı (%)
   - ⚠️ **Malzeme Kaybı Tablosu**:
     - Beklenen Stok vs. Fiili Stok
     - Kayıp Değeri (₺)
   - 📄 Satış Detayları (her ürün)

---

## 🔄 İŞ AKIŞI ÖRNEĞI

### Senaryo: Tedarikçiden Kahve Malzemesi Satın Al

1. **Tedarikçi Ekle**
   - `/suppliers` → "Kahve Tedarikçisi Ltd." ekle

2. **Fatura Giriş**
   - `/invoices` →
   - Tedarikçi: "Kahve Tedarikçisi Ltd."
   - Fatura No: F-2024-001
   - Tarih: 15 Nisan 2024
   - Malzeme Seç:
     - Ethiopia Yöresel (2kg) @ ₺150/kg → Line Total: ₺300
     - Şeker (5kg) @ ₺10/kg → Line Total: ₺50
   - **Kaydet** → Database'de:
     - Fatura kaydı oluşturulur
     - `inventory` tablosu:
       - Ethiopia: +2kg ✅
       - Şeker: +5kg ✅
     - `price_history` tablosu:
       - Ethiopia fiyatı: ₺150 (yeni fiyat logla)
       - Şeker fiyatı: ₺10 (yeni fiyat logla)

3. **Satış Yap** (Mevcut dashboard)
   - Ürün: "Espresso" (@₺30, malzeme: 0.02kg Ethiopia + 2 tane şeker)
   - **Satış kaydı** → Recipes'deki malzeme otomatik azalır:
     - Ethiopia: -0.02kg
     - Şeker: -2

4. **Fiziksel Sayım** (1 Ay Sonra)
   - `/inventory` →
   - **Beklenen Stok**:
     - Ethiopia: 2kg - 0.5kg (satışlar) = 1.5kg
     - Şeker: 5kg - 50 (satışlar) = 4.5kg
   - **Fiili Sayım Yap**:
     - Ethiopia: 1.3kg gir → **⚠️ Kayıp: 0.2kg**
     - Şeker: 4.5kg gir → **✅ Eşleşti!**

5. **Kar-Zarar Raporu**
   - `/reports` → Tarih: 1 Nisan - 30 Mayıs
   - **Özet**:
     - Satış: ₺5000
     - Malzeme Maliyeti: ₺2000
     - **Kar: ₺3000 (60% Marj)**
     - **Malzeme Kaybı: ₺30 (0.2kg × ₺150)**

---

## 💡 SİSTEM AYRINTILARI

### Otomatik Fonksiyonlar
✅ **Fatura Giriş** → Inventory stok artır
✅ **Satış Kaydı** → Malzeme stok azalt (recipes'den)
✅ **Fiyat Değişim** → Price History'ye otomatik kaydet
✅ **Kar Hesabı** → (Satış × Qty) - (Malzeme × Qty)

### Raporlama Özellikleri
- 📊 Satış geliri
- 💸 Malzeme maliyeti (tarihçeli)
- 💰 Net kar + Marj%
- ⚠️ Malzeme kaybı analizi (fiziksel vs. sistem)
- 📈 Ürün-wise kar analizi

---

## 🐛 SORUN GIDERMESİ

### "API hatası: Tedarikçiler yüklenemedi"
✅ Veritabanı tabloları oluşturuldu mu?
   - Supabase → SQL Editor → SQL migration çalıştırıldı mı?

### "Malzeme dropdown boş"
✅ `/recipes` endpoint'ine recipes var mı?
✅ Herhangi bir ürün eklendi ve malzeme tanımlandı mı?

### "Fatura kaydı olmuyor"
✅ Tedarikçi seçildi mi?
✅ En az 1 malzeme eklendi mi?
✅ Beraber submit edildi mi?

---

## 🎓 SONRAKI ADIMLAR

### İyileştirmeler (İsteğe bağlı)
1. **Batch Export**: Raporları Excel'e indir
2. **Grafik Analiz**: Kar trendi göster
3. **Bildirim**: Stok azaldığında SMS/Email
4. **Çok Kullanıcı**: Rol-bazlı erişim
5. **Dönemsel Kapanış**: Aylık/Yıllık son bakişı

---

## 📧 Sorularım?

Herhangi bir adımda takılırsan, screenshot gönder veya sat hata mesajını paylaş.

**Başarılar!** ☕📊
