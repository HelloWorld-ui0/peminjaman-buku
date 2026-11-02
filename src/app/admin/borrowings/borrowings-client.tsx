"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  AlertTriangle,
  ArrowLeftRight,
  Eye,
  X,
  Loader2,
  Calendar,
  BookOpen,
  User,
} from "lucide-react";

interface BorrowingItem {
  id: string;
  borrowDate: string;
  dueDate: string;
  approvedAt: string | null;
  returnedAt: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    nis: string | null;
    email: string;
    className: string | null;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    coverUrl: string | null;
    availableStock: number;
    totalStock: number;
    category: {
      name: string;
    };
  };
}

interface BorrowingsClientProps {
  initialBorrowings: BorrowingItem[];
}

export function AdminBorrowingsClient({ initialBorrowings }: BorrowingsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [detailItem, setDetailItem] = useState<BorrowingItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAction = async (id: string, action: "approve" | "reject" | "return" | "extend") => {
    let confirmPrompt = "";
    if (action === "approve") confirmPrompt = "Setujui peminjaman ini? Stok buku akan berkurang 1.";
    if (action === "reject") confirmPrompt = "Tolak permohonan peminjaman ini?";
    if (action === "return") confirmPrompt = "Konfirmasi pengembalian buku? Stok buku fisik akan bertambah 1.";
    if (action === "extend") confirmPrompt = "Perpanjang masa pinjam buku ini 7 hari?";

    if (confirmPrompt && !confirm(confirmPrompt)) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/borrowings/${id}/${action}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses transaksi");
      }

      showToast(data.message || "Aksi berhasil diproses!");
      router.refresh();
      if (detailItem && detailItem.id === id) {
        setDetailItem(null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const now = new Date();

  const filtered = initialBorrowings.filter((item) => {
    const matchesSearch =
      item.user.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.user.nis && item.user.nis.includes(search)) ||
      item.book.title.toLowerCase().includes(search.toLowerCase()) ||
      item.book.isbn.includes(search);

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "OVERDUE") {
      return item.status === "APPROVED" && new Date(item.dueDate) < now;
    }
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-[#172554] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-blue-400/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Sirkulasi & Pengembalian Buku
          </h1>
          <p className="text-xs text-slate-500">
            Persetujuan permohonan pinjam, verifikasi pengembalian buku, dan denda keterlambatan.
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa, NIS, judul buku, atau ISBN..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: "ALL", label: "Semua Status" },
            { key: "PENDING", label: "Pending" },
            { key: "APPROVED", label: "Aktif Pinjam" },
            { key: "OVERDUE", label: "Terlambat" },
            { key: "RETURNED", label: "Dikembalikan" },
            { key: "REJECTED", label: "Ditolak" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Circulation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Peminjam</th>
                <th className="px-4 py-3.5">Judul Buku</th>
                <th className="px-4 py-3.5">Tgl Pinjam</th>
                <th className="px-4 py-3.5">Jatuh Tempo</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi Sirkulasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada transaksi sirkulasi yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const dueDate = new Date(item.dueDate);
                  const isOverdue = item.status === "APPROVED" && now > dueDate;
                  const diffDays = Math.ceil(
                    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Borrower */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {item.user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block font-['Plus_Jakarta_Sans']">
                              {item.user.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              NIS: {item.user.nis || "Admin"} • {item.user.className || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Book */}
                      <td className="px-4 py-4 max-w-xs">
                        <span className="font-bold text-slate-900 block truncate">
                          {item.book.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          ISBN: {item.book.isbn} • Stok: {item.book.availableStock}/
                          {item.book.totalStock}
                        </span>
                      </td>

                      {/* Borrow Date */}
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(item.borrowDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`block font-medium ${isOverdue ? "text-red-600 font-bold" : "text-slate-800"}`}>
                          {dueDate.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {item.status === "APPROVED" && (
                          <span className={`text-[10px] block ${isOverdue ? "text-red-600 font-bold" : "text-slate-400"}`}>
                            {isOverdue ? `Terlambat ${Math.abs(diffDays)} hari` : `${diffDays} hari tersisa`}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {item.status === "PENDING" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Menunggu Approval
                          </span>
                        )}
                        {item.status === "APPROVED" && (
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${isOverdue ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                            {isOverdue ? "Terlambat" : "Aktif Dipinjam"}
                          </span>
                        )}
                        {item.status === "RETURNED" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Dikembalikan
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
                            Ditolak
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Detail Transaksi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* PENDING Actions: Approve / Reject */}
                          {item.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleAction(item.id, "approve")}
                                disabled={loadingId === item.id || item.book.availableStock <= 0}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                                title="Setujui Pinjaman"
                              >
                                {loadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  "Setujui"
                                )}
                              </button>
                              <button
                                onClick={() => handleAction(item.id, "reject")}
                                disabled={loadingId === item.id}
                                className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition-all cursor-pointer"
                                title="Tolak Permohonan"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {/* APPROVED Actions: Process Return & Extend */}
                          {item.status === "APPROVED" && (
                            <>
                              <button
                                onClick={() => handleAction(item.id, "return")}
                                disabled={loadingId === item.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                title="Proses Pengembalian Buku"
                              >
                                {loadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Kembalikan</span>
                              </button>
                              <button
                                onClick={() => handleAction(item.id, "extend")}
                                disabled={loadingId === item.id}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                                title="Perpanjang 7 Hari"
                              >
                                <RotateCw className="w-4 h-4 text-blue-600" />
                              </button>
                            </>
                          )}
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

      {/* Transaction Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Detail Transaksi Sirkulasi
                </h3>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Book Info */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                  {detailItem.book.coverUrl ? (
                    <img
                      src={detailItem.book.coverUrl}
                      alt={detailItem.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      Buku
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {detailItem.book.title}
                  </span>
                  <span className="text-slate-500 block">
                    Penulis: {detailItem.book.author} • ISBN: {detailItem.book.isbn}
                  </span>
                  <span className="text-blue-600 font-semibold block mt-0.5">
                    Kategori: {detailItem.book.category.name}
                  </span>
                </div>
              </div>

              {/* Student Info */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Data Siswa Peminjam
                </span>
                <p className="font-bold text-slate-900">{detailItem.user.name}</p>
                <p className="text-slate-500">
                  NIS: {detailItem.user.nis || "-"} • Kelas: {detailItem.user.className || "-"} • Email:{" "}
                  {detailItem.user.email}
                </p>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Tanggal Pengajuan
                  </span>
                  <p className="font-bold text-slate-800">
                    {new Date(detailItem.borrowDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Batas Jatuh Tempo
                  </span>
                  <p className="font-bold text-red-600">
                    {new Date(detailItem.dueDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {detailItem.approvedAt && (
                <div className="text-slate-500 text-[11px]">
                  Disetujui petugas: {new Date(detailItem.approvedAt).toLocaleString("id-ID")}
                </div>
              )}
              {detailItem.returnedAt && (
                <div className="text-emerald-700 font-semibold text-[11px]">
                  Buku telah dikembalikan: {new Date(detailItem.returnedAt).toLocaleString("id-ID")}
                </div>
              )}

              {/* Actions in Modal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                {detailItem.status === "PENDING" && (
                  <button
                    onClick={() => handleAction(detailItem.id, "approve")}
                    disabled={loadingId === detailItem.id || detailItem.book.availableStock <= 0}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Setujui Sekarang
                  </button>
                )}
                {detailItem.status === "APPROVED" && (
                  <button
                    onClick={() => handleAction(detailItem.id, "return")}
                    disabled={loadingId === detailItem.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Proses Pengembalian
                  </button>
                )}
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
