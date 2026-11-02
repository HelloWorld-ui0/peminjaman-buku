"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Grid,
  List,
  BookOpen,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Layers,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  description: string | null;
  coverUrl: string | null;
  categoryId: string;
  totalStock: number;
  availableStock: number;
  category: { id: string; name: string };
}

interface CatalogClientProps {
  books: Book[];
  categories: Category[];
  totalBooks: number;
  currentPage: number;
  totalPages: number;
  initialQuery: string;
  initialCategory: string;
  initialAvailableOnly: boolean;
}

export function BookCatalogClient({
  books,
  categories,
  totalBooks,
  currentPage,
  totalPages,
  initialQuery,
  initialCategory,
  initialAvailableOnly,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [availableOnly, setAvailableOnly] = useState(initialAvailableOnly);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Borrow Modal State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [durationDays, setDurationDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const updateFilters = (newParams: { q?: string; category?: string; available?: boolean; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.q !== undefined) {
      if (newParams.q) params.set("q", newParams.q);
      else params.delete("q");
    }

    if (newParams.category !== undefined) {
      if (newParams.category) params.set("category", newParams.category);
      else params.delete("category");
    }

    if (newParams.available !== undefined) {
      if (newParams.available) params.set("available", "true");
      else params.delete("available");
    }

    if (newParams.page !== undefined) {
      params.set("page", newParams.page.toString());
    } else {
      params.set("page", "1");
    }

    router.push(`/student/books?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search });
  };

  const handleCategoryClick = (catId: string) => {
    const next = selectedCat === catId ? "" : catId;
    setSelectedCat(next);
    updateFilters({ category: next });
  };

  const handleAvailableToggle = () => {
    const next = !availableOnly;
    setAvailableOnly(next);
    updateFilters({ available: next });
  };

  const handleReset = () => {
    setSearch("");
    setSelectedCat("");
    setAvailableOnly(false);
    router.push("/student/books");
  };

  // Borrow submission
  const handleBorrowSubmit = async () => {
    if (!selectedBook) return;
    setSubmitting(true);
    setModalFeedback(null);

    try {
      const res = await fetch("/api/borrowings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook.id,
          durationDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalFeedback({ type: "error", message: data.error || "Gagal mengajukan peminjaman." });
        setSubmitting(false);
        return;
      }

      setModalFeedback({
        type: "success",
        message: data.message || "Pengajuan peminjaman berhasil dikirim!",
      });

      setTimeout(() => {
        setSelectedBook(null);
        setModalFeedback(null);
        setSubmitting(false);
        router.refresh();
      }, 1500);
    } catch (e: any) {
      setModalFeedback({ type: "error", message: "Gagal terhubung ke server." });
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Control Center (Exact Stitch Styling) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Row 1: Search, View Toggle, Availability Checkbox */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul buku, penulis, penerbit, atau nomor ISBN..."
              className="w-full h-11 pl-10 pr-20 rounded-xl bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs border border-slate-200/80 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all shadow-xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    updateFilters({ q: "" });
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-500 text-[10px] font-mono font-semibold">
                ⌘K
              </kbd>
            </div>
          </form>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* Availability Filter Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={handleAvailableToggle}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>Hanya yang Tersedia</span>
            </label>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === "grid" ? "bg-white text-blue-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Tampilan Kisi"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === "list" ? "bg-white text-blue-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Tampilan Daftar"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category Pill Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Kategori:
          </span>
          <button
            type="button"
            onClick={() => handleCategoryClick("")}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all shadow-xs ${
              !selectedCat
                ? "bg-[#172554] text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategoryClick(c.id)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all shadow-xs ${
                selectedCat === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Active Filter Chips */}
        {(selectedCat || search || availableOnly) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] text-slate-400">Filter Aktif:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                Pencarian: "{search}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ q: "" })} />
              </span>
            )}
            {selectedCat && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                Kategori: {categories.find((c) => c.id === selectedCat)?.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryClick("")} />
              </span>
            )}
            {availableOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                Stok Tersedia Saja
                <X className="w-3 h-3 cursor-pointer" onClick={handleAvailableToggle} />
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-blue-600 hover:underline ml-2"
            >
              Reset Semua
            </button>
          </div>
        )}
      </div>

      {/* Catalog Results Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 font-['Plus_Jakarta_Sans'] text-sm">
            Daftar Koleksi Buku
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {totalBooks} buku ditemukan
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Buku fisik siap dipinjam langsung di Perpustakaan Lantai 2</span>
        </div>
      </div>

      {/* Books Display (Grid or List) */}
      {books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada buku yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter kategori untuk melihat koleksi lainnya.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const isAvailable = book.availableStock > 0;

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover Container */}
                  <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-xs border border-slate-100">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-100">
                        {book.title}
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#172554]/85 text-white backdrop-blur-md text-[10px] font-bold">
                      {book.category.name}
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold shadow-xs">
                      Tahun {book.publicationYear}
                    </div>
                  </div>

                  {/* Book Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono text-[11px]">ISBN: {book.isbn}</span>
                      <span className={`font-semibold ${isAvailable ? "text-blue-600" : "text-red-500"}`}>
                        {isAvailable ? `Tersedia ${book.availableStock}/${book.totalStock} Eks.` : "Stok Habis"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 font-['Plus_Jakarta_Sans']">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500">{book.author} • {book.publisher}</p>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {book.description || "Buku referensi perpustakaan sekolah SMA Harapan Bangsa."}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/student/books/${book.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors"
                  >
                    Detail Lengkap
                  </Link>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedBook(book);
                      setModalFeedback(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all ${
                      isAvailable
                        ? "bg-[#2563eb] hover:bg-blue-700 text-white active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isAvailable ? "Pinjam Buku" : "Habis Dipinjam"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="flex flex-col gap-3">
          {books.map((book) => {
            const isAvailable = book.availableStock > 0;

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-22 rounded-lg overflow-hidden bg-slate-200 shrink-0 shadow-xs border border-slate-200">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Cover</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {book.category.name}
                      </span>
                      <span className="text-slate-400">• ISBN: {book.isbn}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate font-['Plus_Jakarta_Sans']">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{book.author} • {book.publisher}</p>
                    <span className={`text-xs font-semibold ${isAvailable ? "text-emerald-700" : "text-red-500"}`}>
                      {isAvailable ? `Tersedia ${book.availableStock} dari ${book.totalStock} eksemplar` : "Sedang Habis"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Link
                    href={`/student/books/${book.id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    Detail
                  </Link>
                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedBook(book);
                      setModalFeedback(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isAvailable
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Pinjam</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600">
          <span>
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {totalBooks} Koleksi)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: currentPage - 1 })}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none font-semibold shadow-xs"
            >
              ← Sebelumnya
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateFilters({ page: p })}
                  className={`w-8 h-8 rounded-lg font-semibold text-xs transition-colors shadow-xs ${
                    currentPage === p
                      ? "bg-[#172554] text-white"
                      : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: currentPage + 1 })}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none font-semibold shadow-xs"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE BORROWING CONFIRMATION MODAL (Exact Stitch Screen 4 Implementation) */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Pengajuan Peminjaman Buku
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">ISBN: {selectedBook.isbn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {modalFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
                    modalFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {modalFeedback.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span>{modalFeedback.message}</span>
                </div>
              )}

              {/* Book Summary Card */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-20 h-28 rounded-lg overflow-hidden bg-slate-200 shrink-0 shadow-xs border border-slate-200">
                  {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                      Buku
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-xs min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {selectedBook.category.name}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans'] truncate">
                    {selectedBook.title}
                  </h4>
                  <p className="text-slate-600">{selectedBook.author} • Penerbit {selectedBook.publisher} ({selectedBook.publicationYear})</p>
                  <p className="text-emerald-700 font-semibold pt-1">
                    Tersedia {selectedBook.availableStock} dari {selectedBook.totalStock} eksemplar di rak
                  </p>
                </div>
              </div>

              {/* Loan Duration Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Pilih Durasi Peminjaman:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDurationDays(7)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      durationDays === 7
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/15"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">7 Hari Kalender</span>
                    <span className="text-[11px] text-slate-500">Standar peminjaman reguler siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays(14)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      durationDays === 14
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/15"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">14 Hari Kalender</span>
                    <span className="text-[11px] text-slate-500">Buku teks pelajaran & kurikulum</span>
                  </button>
                </div>
              </div>

              {/* Ketentuan Peminjaman Box (Exact Stitch Content) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Ketentuan Sirkulasi Perpustakaan Sekolah:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="block text-[10px] text-slate-400">Batas Kuota</span>
                    <span className="font-bold text-slate-900">Maks. 3 Buku</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="block text-[10px] text-slate-400">Denda Terlambat</span>
                    <span className="font-bold text-red-600">Rp 1.000 / Hari</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="block text-[10px] text-slate-400">Perpanjangan</span>
                    <span className="font-bold text-blue-600">1x Mandiri Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleBorrowSubmit}
                className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengajukan...</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Konfirmasi Ajukan Peminjaman</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
