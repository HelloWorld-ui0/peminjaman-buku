"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  RotateCw,
  X,
  Printer,
  ChevronRight,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface BorrowingItem {
  id: string;
  borrowDate: string;
  dueDate: string;
  approvedAt: string | null;
  returnedAt: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  book: {
    id: string;
    title: string;
    author: string;
    publisher: string;
    isbn: string;
    coverUrl: string | null;
    category: {
      name: string;
    };
  };
}

interface BorrowingsClientProps {
  borrowings: BorrowingItem[];
  studentName: string;
  studentNis: string;
}

export function BorrowingsClient({
  borrowings,
  studentName,
  studentNis,
}: BorrowingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING" | "HISTORY">("ACTIVE");
  const [qrModalItem, setQrModalItem] = useState<BorrowingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isExtendingId, setIsExtendingId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const now = new Date();

  // Filter groups
  const activeLoans = borrowings.filter((b) => b.status === "APPROVED");
  const pendingLoans = borrowings.filter((b) => b.status === "PENDING");
  const historyLoans = borrowings.filter((b) => b.status === "RETURNED" || b.status === "REJECTED");

  // Calculate statistics
  const dueSoonLoans = activeLoans.filter((b) => {
    const due = new Date(b.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  });

  // Calculate overdue fines (Rp 1.000 per day past due date)
  let totalFine = 0;
  activeLoans.forEach((b) => {
    const due = new Date(b.dueDate);
    if (now > due) {
      const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      totalFine += daysOverdue * 1000;
    }
  });

  const remainingQuota = Math.max(0, 3 - activeLoans.length - pendingLoans.length);

  const handleExtend = async (item: BorrowingItem) => {
    if (!confirm(`Perpanjang masa pinjam buku "${item.book.title}" selama 7 hari?`)) {
      return;
    }

    setIsExtendingId(item.id);
    try {
      const res = await fetch(`/api/borrowings/${item.id}/extend`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperpanjang masa pinjam");
      }
      showToast(data.message || "Masa pinjam berhasil diperpanjang 7 hari!", "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsExtendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-white text-xs font-semibold ${
              toastType === "success" ? "bg-[#172554] border border-blue-400/30" : "bg-red-600"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Section (Matching Stitch Design) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
              Sirkulasi Siswa
            </span>
            <span className="text-slate-500 text-xs">• Semester Ganjil 2024/2025</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Peminjaman Saya
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Kelola buku yang sedang kamu pinjam, riwayat pengembalian, dan perpanjangan masa pinjam secara mandiri.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/student/history"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2 text-xs font-bold transition-colors"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Riwayat Lengkap</span>
          </Link>
          <Link
            href="/student/books"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 text-xs font-bold transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Cari Buku Baru</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards (4 Columns matching Stitch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Sedang Dipinjam */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-medium">Buku Aktif Dipinjam</span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-3xl font-extrabold text-[#172554] font-['Plus_Jakarta_Sans']">
                  {activeLoans.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">eksemplar</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Batas kuota serentak: 3 buku</span>
          </div>
        </div>

        {/* Stat 2: Perlu Dikembalikan Segera */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-medium">Perlu Dikembalikan</span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className={`text-3xl font-extrabold font-['Plus_Jakarta_Sans'] ${dueSoonLoans.length > 0 ? "text-red-600" : "text-slate-900"}`}>
                  {dueSoonLoans.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">buku</span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dueSoonLoans.length > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}>
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {dueSoonLoans.length > 0 ? (
              <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Segera kembalikan ke perpustakaan
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Semua pinjaman tepat waktu
              </span>
            )}
          </div>
        </div>

        {/* Stat 3: Total Denda */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-medium">Total Denda Berjalan</span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className={`text-2xl font-extrabold font-['Plus_Jakarta_Sans'] ${totalFine > 0 ? "text-red-600" : "text-[#172554]"}`}>
                  Rp {totalFine.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {totalFine === 0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Bebas dari tunggakan denda</span>
              </>
            ) : (
              <span className="text-red-600 font-bold">Harap segera lunasi di ruang baca</span>
            )}
          </div>
        </div>

        {/* Stat 4: Kuota Peminjaman */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-medium">Sisa Kuota Peminjaman</span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-3xl font-extrabold text-[#172554] font-['Plus_Jakarta_Sans']">
                  {remainingQuota}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  tersedia ({3 - remainingQuota}/3 terpakai)
                </span>
              </div>
            </div>
            {/* Progress circular representation */}
            <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-700">
              {Math.round(((3 - remainingQuota) / 3) * 100)}%
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${((3 - remainingQuota) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between bg-white px-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "ACTIVE"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Sedang Dipinjam</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "ACTIVE" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {activeLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PENDING")}
            className={`py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "PENDING"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Menunggu Persetujuan</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "PENDING" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {pendingLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "HISTORY"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Riwayat Selesai</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "HISTORY" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {historyLoans.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: ACTIVE LOANS */}
      {activeTab === "ACTIVE" && (
        <div className="space-y-4">
          {activeLoans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Tidak Ada Buku yang Sedang Dipinjam
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Kamu belum memiliki pinjaman buku aktif saat ini. Jelajahi katalog buku perpustakaan untuk menambah pengetahuanmu.
              </p>
              <Link
                href="/student/books"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>Buka Katalog Buku</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            activeLoans.map((loan) => {
              const borrowDate = new Date(loan.borrowDate);
              const dueDate = new Date(loan.dueDate);
              const totalDurationMs = dueDate.getTime() - borrowDate.getTime();
              const elapsedMs = Math.max(0, now.getTime() - borrowDate.getTime());
              const percentElapsed = Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100));

              const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = diffDays < 0;
              const isUrgent = diffDays >= 0 && diffDays <= 2;

              return (
                <div
                  key={loan.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full xl:w-7/12">
                    {/* Cover */}
                    <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-200">
                      {loan.book.coverUrl ? (
                        <img
                          src={loan.book.coverUrl}
                          alt={loan.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                          Buku
                        </div>
                      )}
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#172554]/90 text-white text-[9px] font-bold uppercase tracking-wider">
                        {loan.book.category.name}
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex flex-col space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          ISBN: {loan.book.isbn}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Aktif Dipinjam
                        </span>
                      </div>

                      <div>
                        <Link
                          href={`/student/books/${loan.book.id}`}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 font-['Plus_Jakarta_Sans']"
                        >
                          {loan.book.title}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {loan.book.author} • {loan.book.publisher}
                        </p>
                      </div>

                      {/* Borrow Timeline Progress */}
                      <div className="pt-1 flex flex-col gap-1 w-full max-w-md">
                        <div className="flex justify-between items-center text-[11px] text-slate-500">
                          <span>
                            Pinjam:{" "}
                            <strong className="text-slate-800">
                              {borrowDate.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </strong>
                          </span>
                          <span>
                            Jatuh Tempo:{" "}
                            <strong className={isOverdue || isUrgent ? "text-red-600" : "text-slate-800"}>
                              {dueDate.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </strong>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverdue ? "bg-red-600" : isUrgent ? "bg-amber-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${percentElapsed}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badge + Actions */}
                  <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end justify-between w-full xl:w-auto gap-4 pt-2 xl:pt-0">
                    {/* Due Countdown Alert */}
                    <div
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${
                        isOverdue
                          ? "bg-red-50 border-red-200 text-red-700"
                          : isUrgent
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <Clock className="w-4 h-4 shrink-0" />
                      <div className="flex flex-col text-left xl:text-right leading-none">
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {isOverdue ? "Terlambat" : isUrgent ? "Segera Berakhir" : "Sisa Waktu"}
                        </span>
                        <span className="text-xs font-bold pt-0.5">
                          {isOverdue
                            ? `Lewat ${Math.abs(diffDays)} Hari`
                            : `${diffDays} Hari Lagi`}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleExtend(loan)}
                        disabled={isExtendingId === loan.id}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCw className={`w-3.5 h-3.5 text-blue-600 ${isExtendingId === loan.id ? "animate-spin" : ""}`} />
                        <span>Perpanjang (+7 Hari)</span>
                      </button>
                      <button
                        onClick={() => setQrModalItem(loan)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#172554] hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Tampilkan QR</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: PENDING LOANS */}
      {activeTab === "PENDING" && (
        <div className="space-y-4">
          {pendingLoans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Tidak Ada Pengajuan Menunggu Persetujuan
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Saat kamu mengajukan permohonan pinjam buku baru, antrean verifikasi pustakawan akan muncul di sini.
              </p>
            </div>
          ) : (
            pendingLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    {loan.book.coverUrl ? (
                      <img
                        src={loan.book.coverUrl}
                        alt={loan.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        Buku
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                      Menunggu Verifikasi Petugas
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      {loan.book.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Diajukan pada:{" "}
                      {new Date(loan.borrowDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl font-semibold border border-amber-200">
                  Dalam antrean sirkulasi
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: HISTORY LOANS */}
      {activeTab === "HISTORY" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Riwayat Selesai ({historyLoans.length} Transaksi)
            </h3>
            <Link
              href="/student/history"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Halaman Riwayat Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {historyLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada riwayat transaksi yang terselesaikan.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historyLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {loan.book.coverUrl ? (
                        <img
                          src={loan.book.coverUrl}
                          alt={loan.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          Buku
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{loan.book.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Dipinjam: {new Date(loan.borrowDate).toLocaleDateString("id-ID")} •{" "}
                        {loan.returnedAt
                          ? `Dikembalikan: ${new Date(loan.returnedAt).toLocaleDateString("id-ID")}`
                          : "Status Selesai"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {loan.status === "RETURNED" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Selesai Dikembalikan
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                        Permohonan Ditolak
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Return QR Modal (Exact Stitch Modal translation) */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                  Token Pengembalian Mandiri
                </h3>
              </div>
              <button
                onClick={() => setQrModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-center">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                  {qrModalItem.book.title}
                </h4>
                <p className="text-xs text-slate-500 font-mono">ISBN: {qrModalItem.book.isbn}</p>
              </div>

              {/* QR Representation */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center space-y-3">
                <div className="w-36 h-36 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                  <svg className="w-full h-full text-[#172554]" viewBox="0 0 100 100" fill="currentColor">
                    <rect height="28" rx="4" width="28" x="8" y="8" />
                    <rect fill="white" height="16" rx="2" width="16" x="14" y="14" />
                    <rect height="8" rx="1" width="8" x="18" y="18" />
                    <rect height="28" rx="4" width="28" x="64" y="8" />
                    <rect fill="white" height="16" rx="2" width="16" x="70" y="14" />
                    <rect height="8" rx="1" width="8" x="74" y="18" />
                    <rect height="28" rx="4" width="28" x="8" y="64" />
                    <rect fill="white" height="16" rx="2" width="16" x="14" y="70" />
                    <rect height="8" rx="1" width="8" x="18" y="74" />
                    <rect height="6" rx="1" width="18" x="41" y="12" />
                    <rect height="6" rx="1" width="18" x="41" y="24" />
                    <rect height="8" rx="1" width="8" x="46" y="46" />
                    <rect height="6" rx="1" width="18" x="41" y="76" />
                    <rect height="18" rx="2" width="20" x="72" y="72" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="font-mono text-xs text-blue-700 font-bold tracking-widest block">
                    TOKEN: RTN-{qrModalItem.id.substring(0, 8).toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Tunjukkan barcode ini kepada petugas saat pengembalian buku di counter
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setQrModalItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Bukti</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
