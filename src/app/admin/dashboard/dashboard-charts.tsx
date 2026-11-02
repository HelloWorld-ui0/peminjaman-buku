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
  AreaChart,
  Area,
} from "recharts";

interface MonthlyData {
  month: string;
  pinjam: number;
  kembali: number;
}

interface DashboardChartsProps {
  monthlyData: MonthlyData[];
}

export function DashboardCharts({ monthlyData }: DashboardChartsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Grafik Sirkulasi Peminjaman & Pengembalian
          </h3>
          <p className="text-xs text-slate-500">Statistik transaksi 6 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600"></span>
            <span className="text-slate-600">Dipinjam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-600">Dikembalikan</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
            />
            <Bar dataKey="pinjam" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={22} />
            <Bar dataKey="kembali" fill="#10b981" radius={[6, 6, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
