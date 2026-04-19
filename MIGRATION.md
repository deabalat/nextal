# 🔧 Veritabanı Setup - Manuel Kurulum

## Adım 1: Supabase Credentials Hazırla
1. [Supabase Dashboard](https://app.supabase.com) aç
2. Projenin seç
3. Sağ üst → Settings → API keys
4. `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` kopyala
5. Dosya oluştur: `.env.local` ve ekle:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Adım 2: SQL Tablolarını Oluştur
1. Supabase Dashboard → SQL Editor (Sol sidebar)
2. `migrations/001_create_tables.sql` dosyasının içeriğini kopyala
3. SQL Editor'e yapıştır
4. **Execute** (yeşil ► buton)

✅ Eğer "relation already exists" hatası alırsan → Normal, tablolar zaten var demek.

## Adım 3: Doğrula
```bash
npm run dev
```
Açılan sayfada "Suppliers" sekmeleri vs. görmelisin → Başarı!

## Tablolar Neler?
- **suppliers**: Tedarikçi bilgisi
- **invoices**: Fatura başlığı (no, tarih, toplam tutar)
- **invoice_items**: Fatura satırları (malzeme, miktar, fiyat)
- **inventory**: Mevcut stok seviyeleri
- **price_history**: Malzeme fiyat değişim geçmişi
