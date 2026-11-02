"use client";

import React from "react";
import Link from "next/link";
import { Bell, ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  adminName?: string;
  pendingCount?: number;
}

export function AdminHeader({
  adminName = "Ibu Sarah (Pustakawan)",
  pendingCount = 1,
}: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-6 flex items-center justify-between gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Page Context Badge */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
          Meja Sirkulasi Digital
        </span>
        <span className="text-xs text-slate-500 hidden sm:inline">• Gedung A Lantai 2</span>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-4">
        {/* Pending Requests Alert */}
        {pendingCount > 0 && (
          <Link
            href="/admin/borrowings"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{pendingCount} Permintaan Menunggu Persetujuan</span>
          </Link>
        )}

        <div className="h-6 w-px bg-slate-200" />

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right leading-tight">
            <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              {adminName}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold">Administrator Perpustakaan</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
