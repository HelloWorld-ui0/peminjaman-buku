import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock,
  RotateCw,
  QrCode,
  Inbox,
  MessageSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getSession();
  const userId = session?.userId;

  // 1. Fetch active loans (APPROVED) for this student
  const activeLoans = await prisma.borrowing.findMany({
    where: {
      userId: userId || "",
      status: "APPROVED",
    },
    include: {
      book: {
        include: { category: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  // 2. Fetch pending requests
  const pendingRequests = await prisma.borrowing.findMany({
    where: {
      userId: userId || "",
      status: "PENDING",
    },
    include: { book: true },
  });

  // 3. Fetch completed history count
  const returnedCount = await prisma.borrowing.count({
    where: {
      userId: userId || "",
      status: "RETURNED",
    },
  });

  // 4. Overdue check
  const now = new Date();
  let overdueLoansCount = 0;
  let dueSoonLoan: any = null;
  let minDaysLeft = 999;

  activeLoans.forEach((loan) => {
    const diff = Math.ceil((loan.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      overdueLoansCount++;
    } else if (diff < minDaysLeft) {
      minDaysLeft = diff;
      dueSoonLoan = loan;
    }
  });

  // 5. Recommended Books (curated books)
  const recommendedBooks = await prisma.book.findMany({
    take: 4,
    where: { availableStock: { gt: 0 } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  // 6. Popular Books (books with most borrowings)
  const popularBooks = await prisma.book.findMany({
    take: 3,
    include: {
      category: true,
      _count: { select: { borrowings: true } },
    },
    orderBy: { borrowings: { _count: "desc" } },
  });

  const quotaMax = 3;
  const currentLoanCount = activeLoans.length;
  const quotaPercent = Math.min(100, Math.round((currentLoanCount / quotaMax) * 100));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Greeting Banner (Exact Stitch Styling) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#172554] text-white p-6 sm:p-8 shadow-md">
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-24 w-60 h-60 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md w-fit border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold tracking-wider uppercase text-blue-100">
                Portal Siswa Terverifikasi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
              Selamat Datang Kembali, {session?.name || "Ahmad Rayhan"}! 👋
            </h1>
            <p className="text-sm text-blue-100/90">
              Semester Ganjil 2024/2025 • NIS: {session?.nis || "123456"} • Kelas: {session?.className || "XII MIPA 1"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/student/books"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-semibold hover:bg-blue-600 transition-all shadow-md active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Cari Buku Pelajaran & Fiksi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Sedang Dipinjam */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Sedang Dipinjam</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {currentLoanCount}
              </span>
              <span className="text-xs text-slate-500">/ {quotaMax} Kuota Buku</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sisa slot: {Math.max(0, quotaMax - currentLoanCount)} buku</span>
            <span className="text-blue-600 font-semibold">Maks. {quotaMax}</span>
          </div>
        </div>

        {/* Metric 2: Jatuh Tempo Segera */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Jatuh Tempo Segera</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-['Plus_Jakarta_Sans'] ${dueSoonLoan ? "text-amber-600" : "text-slate-900"}`}>
                {dueSoonLoan ? 1 : 0}
              </span>
              <span className="text-xs text-slate-500">buku</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mt-2.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{dueSoonLoan ? `Tersisa ${minDaysLeft} Hari` : "Tidak ada tenggat dekat"}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate max-w-[140px]">{dueSoonLoan ? dueSoonLoan.book.title : "-"}</span>
            <span className="text-amber-600 font-medium">
              {dueSoonLoan ? new Date(dueSoonLoan.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Aman"}
            </span>
          </div>
        </div>

        {/* Metric 3: Terlambat & Denda */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Keterlambatan</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${overdueLoansCount > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-['Plus_Jakarta_Sans'] ${overdueLoansCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                {overdueLoansCount}
              </span>
              <span className="text-xs text-slate-500">buku lewat batas</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mt-2.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{overdueLoansCount === 0 ? "Bebas Denda Sirkulasi" : "Segera kembalikan!"}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Denda Aktif</span>
            <span className="font-mono font-bold text-slate-900">Rp 0</span>
          </div>
        </div>

        {/* Metric 4: Total Selesai Dibaca */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Buku Dibaca</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {returnedCount}
              </span>
              <span className="text-xs text-slate-500">buku terselesaikan</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mt-2.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Literasi Siswa Aktif</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Reader Club</span>
            <span className="text-blue-600 font-semibold">Tingkat Sekolah</span>
          </div>
        </div>
      </div>

      {/* Main 12-Column Layout (8-col Left / 4-col Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Section: Buku Pinjaman Aktif */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Buku Pinjaman Aktif & Tenggat Waktu
                </h2>
              </div>
              <Link
                href="/student/borrowings"
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Lihat Semua ({activeLoans.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeLoans.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada buku yang sedang dipinjam</p>
                <p className="text-xs text-slate-500 mt-1">Eksplorasi katalog untuk menemukan buku bacaan menarik.</p>
                <Link
                  href="/student/books"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Jelajahi Buku</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeLoans.map((loan) => {
                  const daysLeft = Math.ceil((loan.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 2;

                  return (
                    <div
                      key={loan.id}
                      className="p-4 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Book Cover */}
                        <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0 shadow-xs border border-slate-200">
                          {loan.book.coverUrl ? (
                            <img
                              src={loan.book.coverUrl}
                              alt={loan.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-100">
                              Buku
                            </div>
                          )}
                        </div>

                        {/* Loan Info */}
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 font-medium border border-slate-200">
                              {loan.book.category.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${isUrgent ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                              {daysLeft <= 0 ? "Terlambat" : `Jatuh tempo: ${new Date(loan.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 truncate font-['Plus_Jakarta_Sans']">
                            {loan.book.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {loan.book.author} • ISBN: {loan.book.isbn}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <Link
                          href={`/student/books/${loan.bookId}`}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          Detail Buku
                        </Link>
                        <Link
                          href="/student/borrowings"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Pengembalian</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section: Rekomendasi Buku Untukmu */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Rekomendasi Buku Untukmu
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kurasi khusus siswa SMA Harapan Bangsa untuk Kurikulum Merdeka & Literasi
                </p>
              </div>
              <Link href="/student/books" className="text-xs text-blue-600 hover:underline font-semibold">
                Lihat Katalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-3 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-200/70 flex flex-col justify-between group transition-all"
                >
                  <div>
                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-200 mb-2.5 shadow-xs">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-100">
                          Cover
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-800">
                        {book.category.name}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors font-['Plus_Jakarta_Sans']">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{book.author}</p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Tersedia: {book.availableStock}
                    </span>
                    <Link
                      href={`/student/books/${book.id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Pinjam →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Buku Populer Pekan Ini */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Buku Paling Populer di Perpustakaan
                </h2>
              </div>
              <span className="text-xs text-slate-500">Berdasarkan data sirkulasi siswa</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {popularBooks.map((book, idx) => (
                <div
                  key={book.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5"
                >
                  <div className="w-12 h-16 rounded-md overflow-hidden bg-slate-200 shrink-0 shadow-xs">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Buku</div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-blue-600">#{idx + 1}</span>
                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold truncate">
                        {book.category.name}
                      </span>
                    </div>
                    <Link
                      href={`/student/books/${book.id}`}
                      className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 mt-1 font-['Plus_Jakarta_Sans']"
                    >
                      {book.title}
                    </Link>
                    <span className="text-[11px] text-slate-500 truncate">{book.author}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{book._count.borrowings}x transaksi peminjaman</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (4 Cols: Calendar, DropBox, Timetable) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Calendar Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Jadwal Pengembalian
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              </span>
            </div>

            {/* Mini Calendar Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                <span key={d} className="text-[10px] text-slate-400 font-semibold py-1">
                  {d}
                </span>
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                const dayNum = 20 + i;
                const isDueDay = dayNum === 24 || dayNum === 28;
                return (
                  <span
                    key={i}
                    className={`py-1.5 rounded-lg text-xs font-semibold ${
                      isDueDay
                        ? "bg-blue-600 text-white shadow-xs"
                        : dayNum === 22
                        ? "bg-slate-200 text-slate-900 font-bold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {dayNum > 31 ? dayNum - 31 : dayNum}
                  </span>
                );
              })}
            </div>

            {/* Drop Box info */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
              <Inbox className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-slate-900">Pengembalian Mandiri (Drop Box)</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Tersedia di Lobi Perpustakaan 24 jam. Pindai barcode kartu siswa sebelum memasukkan buku ke kotak pintar.
                </p>
              </div>
            </div>
          </div>

          {/* Operational Hours Card (Exact Stitch Styling) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#172554] to-[#0f172a] text-white shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                Jam Layanan Perpustakaan
              </h3>
            </div>
            <p className="text-xs text-blue-200/90 leading-relaxed">
              Ruang baca perpustakaan terbuka untuk peminjaman langsung, akses e-Library, dan diskusi kelompok.
            </p>
            <div className="space-y-1.5 p-3 rounded-xl bg-white/10 backdrop-blur-sm text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-blue-200">Senin – Kamis</span>
                <span className="font-bold text-white">07.30 – 16.00 WIB</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-blue-200">Jumat</span>
                <span className="font-bold text-white">07.30 – 11.30 WIB</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-white/10">
                <span>Sabtu – Minggu / Libur</span>
                <span>Tutup (Drop Box Aktif)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-blue-200 pt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Gedung Literasi, Lt. 2</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                Buka Hari Ini
              </span>
            </div>
          </div>

          {/* Help & Librarian Contact Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Butuh Buku Referensi?</p>
                <p className="text-[11px] text-slate-500">Hubungi Ibu Sarah di Meja Sirkulasi</p>
              </div>
            </div>
            <Link
              href="/student/books"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Cari di Katalog"
            >
              <Search className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
