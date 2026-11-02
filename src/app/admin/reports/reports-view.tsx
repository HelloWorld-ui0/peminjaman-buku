"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Printer, Download, BookOpen, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface ReportsViewProps {
  totalTransactions: number;
  activeCount: number;
  returnedCount: number;
  overdueCount: number;
  monthlyStats: { month: string; total: number; returned: number }[];
  mostBorrowedBooks: {
    id: string;
    title: string;
    author: string;
    category: string;
    count: number;
  }[];
  overdueList: {
    id: string;
    studentName: string;
    studentNis: string;
    bookTitle: string;
    dueDate: string;
    daysOverdue: number;
  }[];
}

const STATUS_COLORS = ["#2563eb", "#10b981", "#ef4444", "#f59e0b"];

export function ReportsView({
  totalTransactions,
  activeCount,
  returnedCount,
  overdueCount,
  monthlyStats,
  mostBorrowedBooks,
  overdueList,
}: ReportsViewProps) {
  const pieData = [
    { name: "Sedang Dipinjam", value: activeCount },
    { name: "Selesai Dikembalikan", value: returnedCount },
    { name: "Terlambat", value: overdueCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Laporan & Rekapitulasi Perpustakaan
          </h1>
          <p className="text-xs text-slate-500">
            Laporan berkala sirkulasi peminjaman, buku terpopuler, dan kepatuhan pengembalian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Transaksi</span>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#172554] font-['Plus_Jakarta_Sans']">
              {totalTransactions}
            </span>
            <span className="text-xs text-slate-400">sepanjang waktu</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sedang Dipinjam</span>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600 font-['Plus_Jakarta_Sans']">
              {activeCount}
            </span>
            <span className="text-xs text-slate-400">buku aktif</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Selesai Dikembalikan</span>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-['Plus_Jakarta_Sans']">
              {returnedCount}
            </span>
            <span className="text-xs text-slate-400">tuntas</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tunggakan Terlambat</span>
          <div className="pt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-['Plus_Jakarta_Sans'] ${overdueCount > 0 ? "text-red-600" : "text-slate-800"}`}>
              {overdueCount}
            </span>
            <span className="text-xs text-slate-400">perlu tindakan</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Tren Sirkulasi Bulanan (6 Bulan Terakhir)
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan akumulasi peminjaman vs pengembalian buku
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} name="Total Pinjam" />
                <Bar dataKey="returned" fill="#10b981" radius={[6, 6, 0, 0]} name="Dikembalikan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Rasio Status Sirkulasi
            </h3>
            <p className="text-xs text-slate-500">Komposisi sirkulasi buku saat ini</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Aktif Dipinjam</span>
              </span>
              <span className="font-bold text-slate-800">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Selesai Dikembalikan</span>
              </span>
              <span className="font-bold text-slate-800">{returnedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Terlambat</span>
              </span>
              <span className="font-bold text-slate-800">{overdueCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Tables: Most Borrowed Books & Overdue Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              Buku Paling Sering Dipinjam
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {mostBorrowedBooks.map((b, idx) => (
              <div key={b.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center font-bold text-slate-400 font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block truncate">{b.title}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {b.author} • {b.category}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-blue-600">{b.count} Peminjaman</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Books List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Daftar Buku Terlambat ({overdueList.length})</span>
            </h3>
          </div>
          {overdueList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada buku yang melewati batas jatuh tempo saat ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {overdueList.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.bookTitle}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Peminjam: <strong className="text-slate-700">{item.studentName}</strong> (NIS:{" "}
                      {item.studentNis})
                    </span>
                    <span className="text-[11px] text-red-600 font-medium">
                      Jatuh tempo: {item.dueDate}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                      Lewat {item.daysOverdue} Hari
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
