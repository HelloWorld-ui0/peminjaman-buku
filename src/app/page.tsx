import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter']">
      {/* Top Navbar */}
      <header className="h-18 bg-white border-b border-slate-200/80 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#172554] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            LK
          </div>
          <div>
            <span className="font-extrabold text-lg text-[#172554] tracking-tight font-['Plus_Jakarta_Sans'] block leading-none">
              LIBRARYKU
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Sistem Perpustakaan Sekolah Terpadu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login/student"
            className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl transition-colors"
          >
            Portal Siswa
          </Link>
          <Link
            href="/login/admin"
            className="text-xs font-bold text-white bg-[#172554] hover:bg-slate-900 px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            Panel Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 sm:py-16 flex flex-col justify-center space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Vocational High School Software Assessment (PPLG)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
            Digitalisasi Layanan Pustaka & Sirkulasi Buku Mandiri
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Aplikasi manajemen perpustakaan modern dengan katalog buku digital, sirkulasi peminjaman
            mandiri, verifikasi persetujuan pustakawan, dan rekapitulasi data terintegrasi.
          </p>
        </div>

        {/* 2 Main Entry Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Card 1: Student Portal */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between relative group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  Untuk Siswa / Anggota
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                  Portal Siswa
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Jelajahi koleksi buku pelajaran, fiksi, dan teknologi. Ajukan pinjaman mandiri, cek
                  tenggat waktu jatuh tempo, serta pantau riwayat pengembalian.
                </p>
              </div>

              {/* Demo Credential Quick-Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Akun Demo Siswa:</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Siap Digunakan
                  </span>
                </div>
                <p className="text-slate-600 font-mono text-[11px]">
                  NIS: <strong>123456</strong> • Pass: <strong>Student123!</strong>
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/login/student"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Masuk ke Portal Siswa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Admin Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-slate-800 transition-all flex flex-col justify-between relative group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  Untuk Petugas & Pustakawan
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                  Panel Administrasi
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Kelola katalog buku, kategori, master data siswa, verifikasi permohonan sirkulasi,
                  proses pengembalian dengan update stok otomatis, dan rekapitulasi laporan.
                </p>
              </div>

              {/* Demo Credential Quick-Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Akun Demo Administrator:</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Akses Penuh
                  </span>
                </div>
                <p className="text-slate-600 font-mono text-[11px]">
                  Email: <strong>admin@libraryku.com</strong> • Pass: <strong>Admin123!</strong>
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/login/admin"
                className="w-full py-3 rounded-2xl bg-[#0f172a] hover:bg-black text-white font-bold text-xs shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Masuk ke Panel Petugas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* System Features Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200/70">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">16+ Buku Siap Pinjam</span>
              <span className="text-[10px] text-slate-400">Pelajaran & Referensi</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">Transaksi Atomik</span>
              <span className="text-[10px] text-slate-400">Stok Konsisten & Aman</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">Keamanan Berlapis</span>
              <span className="text-[10px] text-slate-400">JWT HTTP-only Cookie</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">Hitung Denda Otomatis</span>
              <span className="text-[10px] text-slate-400">Jatuh Tempo Real-Time</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>© 2024 LIBRARYKU — School Library Management System • Pengembangan Perangkat Lunak & Gim (PPLG)</p>
      </footer>
    </div>
  );
}
