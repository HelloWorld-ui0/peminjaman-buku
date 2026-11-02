import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  Shield,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  BookmarkPlus,
} from "lucide-react";
import { BookDetailActions } from "./detail-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const book = await prisma.book.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!book) {
    notFound();
  }

  // Check if student currently has active loan for this book
  let existingLoanStatus: string | null = null;
  if (session?.userId) {
    const loan = await prisma.borrowing.findFirst({
      where: {
        userId: session.userId,
        bookId: book.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });
    if (loan) {
      existingLoanStatus = loan.status;
    }
  }

  const isAvailable = book.availableStock > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/student/books"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Katalog Buku</span>
      </Link>

      {/* Main Detail Container (Exact Stitch Modal Design Translated to Full Page) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Detail Koleksi & Peminjaman Buku
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">Kode Buku: {book.isbn}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
            {isAvailable ? "Tersedia di Rak" : "Stok Habis"}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Top 2-Column: Cover + Spec Sheet */}
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Cover Mockup */}
            <div className="w-full sm:w-60 shrink-0">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200 relative group">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-100">
                    Buku
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 bg-[#172554]/90 backdrop-blur-md rounded-xl p-2 text-center text-white text-xs font-bold shadow-xs">
                  Kategori: {book.category.name}
                </div>
              </div>
            </div>

            {/* Spec Sheet & Metadata */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
                  {book.category.name}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight pt-1">
                  {book.title}
                </h2>
                <p className="text-sm text-slate-600">
                  Penulis: <strong className="text-slate-900 font-semibold">{book.author}</strong>
                </p>
              </div>

              {/* Structured Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor ISBN</span>
                  <span className="font-mono font-bold text-slate-900">{book.isbn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Penerbit</span>
                  <span className="font-semibold text-slate-900">{book.publisher}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tahun Publikasi</span>
                  <span className="font-semibold text-slate-900">{book.publicationYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ketersediaan</span>
                  <span className="font-bold text-blue-600">
                    {book.availableStock} dari {book.totalStock} eksemplar
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isAvailable ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
                  <span className="text-xs font-bold text-slate-800">Status Sirkulasi:</span>
                </div>
                <span className="text-xs font-bold text-blue-700">
                  {isAvailable ? `${book.availableStock} Eksemplar Siap Dipinjam` : "Semua Eksemplar Sedang Dipinjam"}
                </span>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Sinopsis & Deskripsi Buku
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
              {book.description || "Tidak ada deskripsi sinopsis untuk buku ini."}
            </p>
          </div>

          {/* Ketentuan Peminjaman Box */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Ketentuan Peminjaman Siswa (LIBRARYKU):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs">
                <span className="block text-[11px] text-slate-400">Durasi Maksimal</span>
                <span className="font-bold text-slate-900">7 Hari Kalender</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs">
                <span className="block text-[11px] text-slate-400">Denda Keterlambatan</span>
                <span className="font-bold text-red-600">Rp 1.000 / Hari</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs">
                <span className="block text-[11px] text-slate-400">Perpanjangan</span>
                <span className="font-bold text-blue-600">1x Mandiri via Portal</span>
              </div>
            </div>
          </div>

          {/* Borrower Profile Preview Strip */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {session?.name?.substring(0, 2).toUpperCase() || "AR"}
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900">
                  Peminjam: {session?.name || "Ahmad Rayhan"}
                </span>
                <span className="block text-[11px] text-slate-500">
                  NIS: {session?.nis || "123456"} • Kelas: {session?.className || "XII MIPA 1"}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-blue-600 border border-slate-200 shadow-xs">
              Batas Kuota: Maks. 3 Buku Serentak
            </span>
          </div>

          {/* Borrow Action Trigger */}
          <BookDetailActions
            bookId={book.id}
            bookTitle={book.title}
            isAvailable={isAvailable}
            existingLoanStatus={existingLoanStatus}
          />
        </div>
      </div>
    </div>
  );
}
