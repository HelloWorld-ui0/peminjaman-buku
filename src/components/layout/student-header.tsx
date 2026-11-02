"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Bell, User } from "lucide-react";

interface StudentHeaderProps {
  userName?: string;
  nis?: string | null;
  urgentDueText?: string;
  notificationCount?: number;
}

export function StudentHeader({
  userName = "Ahmad Rayhan",
  nis = "123456",
  urgentDueText = "Pengembalian: 2 hari lagi",
  notificationCount = 2,
}: StudentHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/student/books?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-6 flex items-center justify-between gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul buku, penulis, kategori, atau ISBN..."
            className="w-full h-10 pl-10 pr-12 rounded-xl bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs border border-slate-200/80 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all shadow-xs"
          />
          <div className="absolute right-3 flex items-center">
            <kbd className="px-1.5 py-0.5 bg-slate-200/70 text-slate-500 rounded text-[10px] font-mono font-semibold">
              ⌘K
            </kbd>
          </div>
        </form>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-4">
        {/* Urgent Due Pill */}
        {urgentDueText && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{urgentDueText}</span>
          </div>
        )}

        {/* Notifications */}
        <button
          type="button"
          onClick={() => alert("Notifikasi Sistem:\\n1. Jangan lupa mengembalikan Fisika Dasar Kelas XII sebelum batas waktu.\\n2. Peminjaman mandiri via Drop Box aktif 24 jam.")}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right leading-tight">
            <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              {userName}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">NIS: {nis || "123456"}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shadow-xs">
            {userName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
