import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kafe Yönetim Sistemi",
  description: "Stok, Fatura ve Kar-Zarar Takibi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Top Navigation Bar */}
          <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold">☕ Kafe Yönetim Sistemi</h1>
              </div>

              <div className="flex gap-6 text-sm font-semibold">
                <Link
                  href="/"
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/suppliers"
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  📦 Tedarikçiler
                </Link>
                <Link
                  href="/invoices"
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  📄 Faturalar
                </Link>
                <Link
                  href="/inventory"
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  📈 Stok
                </Link>
                <Link
                  href="/reports"
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  💰 Raporlar
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-gray-300 text-center py-4 text-sm">
            <p>© 2024 Kafe Yönetim Sistemi | Stok • Fatura • Kar-Zarar Takibi</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
