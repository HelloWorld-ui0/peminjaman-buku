import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIBRARYKU — Sistem Informasi Perpustakaan Sekolah",
  description: "Sistem Manajemen Perpustakaan Sekolah Terpadu SMA Harapan Bangsa untuk pengelolaan katalog buku, sirkulasi peminjaman, dan akun siswa.",
  icons: {
    icon: "/assets/asset_rMz_4tKj_VFWbO_DGuYOGNM_I6_Tyw.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#f8fafc] text-[#0f172a] font-sans">
        {children}
      </body>
    </html>
  );
}
