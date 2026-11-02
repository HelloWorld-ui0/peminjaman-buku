import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  History,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentHistoryPage() {
  const session = await getSession();

  let historyList: any[] = [];
  if (session?.userId) {
    historyList = await prisma.borrowing.findMany({
      where: {
        userId: session.userId,
        status: { in: ["RETURNED", "REJECTED"] },
      },
      include: {
        book: {
          include: { category: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  const returnedCount = historyList.filter((h) => h.status === "RETURNED").length;
  const rejectedCount = historyList.filter((h) => h.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/student/borrowings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Peminjaman Aktif</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Riwayat Peminjaman Buku
          </h1>
          <p className="text-xs text-slate-500">
            Daftar lengkap transaksi peminjaman buku yang telah selesai atau dikembalikan ke perpustakaan.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{returnedCount} Selesai Dikembalikan</span>
          </div>
          {rejectedCount > 0 && (
            <div className="px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>{rejectedCount} Ditolak</span>
            </div>
          )}
        </div>
      </div>

      {/* History Data Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              Semua Catatan Riwayat ({historyList.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Peminjam: <strong className="text-slate-800">{session?.name || "Siswa"}</strong> (NIS:{" "}
            {session?.nis || "123456"})
          </span>
        </div>

        {historyList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
              Belum Ada Riwayat Peminjaman
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Buku yang kamu pinjam dan telah selesai dikembalikan ke perpustakaan akan tercatat secara permanen di sini.
            </p>
            <Link
              href="/student/books"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Jelajahi Buku</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Buku & Pengarang</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Tanggal Pinjam</th>
                  <th className="px-4 py-3.5">Jatuh Tempo</th>
                  <th className="px-4 py-3.5">Tanggal Kembali</th>
                  <th className="px-6 py-3.5 text-right">Status Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {item.book.coverUrl ? (
                            <img
                              src={item.book.coverUrl}
                              alt={item.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                              Buku
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/student/books/${item.book.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {item.book.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.book.author} • ISBN: {item.book.isbn}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {item.book.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium whitespace-nowrap">
                      {new Date(item.borrowDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium whitespace-nowrap">
                      {new Date(item.dueDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.returnedAt ? (
                        <span className="text-emerald-700 font-medium">
                          {new Date(item.returnedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {item.status === "RETURNED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tepat Waktu</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Ditolak Admin</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
