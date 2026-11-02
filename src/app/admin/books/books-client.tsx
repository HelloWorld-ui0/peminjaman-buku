"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  BookOpen,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface BookItem {
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
  category: {
    id: string;
    name: string;
  };
  _count: {
    borrowings: number;
  };
}

interface BooksClientProps {
  initialBooks: BookItem[];
  categories: Category[];
}

export function BooksClient({ initialBooks, categories }: BooksClientProps) {
  const router = useRouter();
  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationYear: new Date().getFullYear(),
    description: "",
    coverUrl: "",
    categoryId: categories[0]?.id || "",
    totalStock: 5,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      isbn: `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-0`,
      publisher: "Pustaka Belajar",
      publicationYear: new Date().getFullYear(),
      description: "",
      coverUrl: "/assets/book-cover-placeholder.svg",
      categoryId: categories[0]?.id || "",
      totalStock: 5,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: BookItem) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      description: book.description || "",
      coverUrl: book.coverUrl || "",
      categoryId: book.categoryId,
      totalStock: book.totalStock,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan buku");
      }

      showToast(data.message || "Buku berhasil disimpan!");
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (book: BookItem) => {
    if (!confirm(`Hapus buku "${book.title}" secara permanen? Data yang dihapus tidak dapat dipulihkan.`)) {
      return;
    }

    setIsDeletingId(book.id);
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus buku");
      }

      showToast(data.message || "Buku berhasil dihapus!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filter books locally
  const filteredBooks = initialBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || book.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-[#172554] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-blue-400/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Manajemen Koleksi Buku
          </h1>
          <p className="text-xs text-slate-500">
            Kelola judul buku, nomor ISBN, stok fisik di perpustakaan, dan kategori koleksi.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul buku, penulis, atau ISBN..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">Semua Kategori ({initialBooks.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Cover & Info Buku</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Penerbit & Tahun</th>
                <th className="px-4 py-3.5 text-center">Stok Fisik</th>
                <th className="px-4 py-3.5 text-center">Dipinjam</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada buku yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const borrowed = book.totalStock - book.availableStock;
                  return (
                    <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Cover & Title */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-15 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {book.coverUrl ? (
                              <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                                Buku
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <span className="font-bold text-slate-900 block truncate font-['Plus_Jakarta_Sans']">
                              {book.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              Penulis: {book.author}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 block">
                              ISBN: {book.isbn}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {book.category.name}
                        </span>
                      </td>

                      {/* Publisher & Year */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <span className="block font-medium">{book.publisher}</span>
                        <span className="text-[11px] text-slate-400">{book.publicationYear}</span>
                      </td>

                      {/* Stock info */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-slate-900">
                          {book.availableStock} / {book.totalStock}
                        </span>
                        <span className="block text-[10px] text-slate-400">Tersedia</span>
                      </td>

                      {/* Borrowed count */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                          {borrowed} Aktif
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Buku"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book)}
                            disabled={isDeletingId === book.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Hapus Buku"
                          >
                            {isDeletingId === book.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    {editingBook ? "Edit Data Buku" : "Tambah Buku Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Isi spesifikasi lengkap untuk katalog perpustakaan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBook} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Buku *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Pemrograman Web dengan Next.js"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              {/* 2-Columns: Author & ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penulis *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nama penulis"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor ISBN *</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-602-xxx"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-mono"
                  />
                </div>
              </div>

              {/* 2-Columns: Publisher & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penerbit *</label>
                  <input
                    type="text"
                    required
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Nama penerbit"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Terbit *</label>
                  <input
                    type="number"
                    required
                    min={1900}
                    max={2100}
                    value={formData.publicationYear}
                    onChange={(e) =>
                      setFormData({ ...formData, publicationYear: parseInt(e.target.value) || 2024 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>

              {/* 2-Columns: Category & Total Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Buku *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Stok Fisik *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalStock}
                    onChange={(e) =>
                      setFormData({ ...formData, totalStock: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>

              {/* Cover URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Cover Gambar Buku
                </label>
                <input
                  type="text"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  placeholder="/assets/cover-xxx.jpg atau https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sinopsis / Deskripsi *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ringkasan materi atau sinopsis buku..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBook ? "Simpan Perubahan" : "Tambahkan Buku"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
