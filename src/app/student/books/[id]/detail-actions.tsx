"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  BookmarkPlus,
  BookOpen,
  Calendar,
  X,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface BookDetailActionsProps {
  bookId: string;
  bookTitle: string;
  isAvailable: boolean;
  existingLoanStatus: string | null;
}

export function BookDetailActions({
  bookId,
  bookTitle,
  isAvailable,
  existingLoanStatus,
}: BookDetailActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState(7);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate return date preview
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + Number(days));
  const formattedReturnDate = returnDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleBorrow = async () => {
    if (!agreeTerms) {
      setError("Silakan setujui syarat dan ketentuan peminjaman");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/borrowings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, days: Number(days) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan peminjaman");
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push("/student/borrowings");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses permohonan");
    } finally {
      setIsLoading(false);
    }
  };

  if (existingLoanStatus === "PENDING") {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-amber-800">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-bold">Pengajuan Sedang Menunggu Persetujuan</p>
            <p className="text-[11px] text-amber-700">
              Anda telah mengajukan buku ini. Silakan pantau status di halaman Peminjaman Saya.
            </p>
          </div>
        </div>
        <Link
          href="/student/borrowings"
          className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          Lihat Peminjaman Saya
        </Link>
      </div>
    );
  }

  if (existingLoanStatus === "APPROVED") {
    return (
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-blue-900">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs font-bold">Buku Sedang Anda Pinjam</p>
            <p className="text-[11px] text-blue-700">
              Buku ini masih berada dalam masa pinjam aktif Anda. Kembalikan ke petugas sebelum jatuh tempo.
            </p>
          </div>
        </div>
        <Link
          href="/student/borrowings"
          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          Cek Tenggat Pengembalian
        </Link>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-600">
          <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-700">Stok Saat Ini Tidak Tersedia</p>
            <p className="text-[11px] text-slate-500">
              Semua eksemplar buku sedang dipinjam oleh siswa lain. Silakan periksa kembali nanti.
            </p>
          </div>
        </div>
        <button
          disabled
          className="text-xs font-bold px-5 py-2.5 rounded-xl bg-slate-200 text-slate-400 cursor-not-allowed"
        >
          Tidak Tersedia
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500">
          Buku siap dipinjam. Pengajuan akan langsung masuk ke antrean verifikasi pustakawan.
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>Ajukan Peminjaman Buku</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookmarkPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Konfirmasi Pengajuan Pinjam
                  </h3>
                  <p className="text-[11px] text-slate-500">Periksa detail peminjaman</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isLoading) setIsOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Pengajuan Berhasil Dikirim!</h4>
                  <p className="text-xs text-slate-500">
                    Mengarahkan ke halaman peminjaman Anda...
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Judul Buku
                    </span>
                    <p className="text-xs font-bold text-slate-900 leading-snug">{bookTitle}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Durasi Peminjaman
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 7, 14].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDays(d)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            days === d
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {d} Hari
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Rencana Pengembalian:</span>
                    </div>
                    <span className="font-bold text-blue-700">{formattedReturnDate}</span>
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Saya berjanji menjaga kondisi fisik buku dengan baik serta mengembalikannya tepat waktu sesuai batas peminjaman perpustakaan.
                    </span>
                  </label>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isLoading || !agreeTerms}
                      onClick={handleBorrow}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Kirim Permohonan</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
