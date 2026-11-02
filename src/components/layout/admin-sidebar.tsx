"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookCopy,
  Tags,
  Users,
  ArrowLeftRight,
  BarChart3,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  adminName?: string;
}

export function AdminSidebar({ adminName = "Petugas Pustakawan" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login/admin");
      router.refresh();
    } catch (e) {
      router.push("/login/admin");
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      label: "Manajemen Buku",
      href: "/admin/books",
      icon: BookCopy,
      active: pathname.startsWith("/admin/books"),
    },
    {
      label: "Kategori Buku",
      href: "/admin/categories",
      icon: Tags,
      active: pathname.startsWith("/admin/categories"),
    },
    {
      label: "Data Siswa",
      href: "/admin/students",
      icon: Users,
      active: pathname.startsWith("/admin/students"),
    },
    {
      label: "Sirkulasi & Peminjaman",
      href: "/admin/borrowings",
      icon: ArrowLeftRight,
      active: pathname.startsWith("/admin/borrowings"),
    },
    {
      label: "Laporan & Statistik",
      href: "/admin/reports",
      icon: BarChart3,
      active: pathname.startsWith("/admin/reports"),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0f172a] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-[#090d16]">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            LK
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base text-white tracking-tight font-['Plus_Jakarta_Sans']">
              LIBRARYKU
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Panel Staf & Administrasi</span>
          </div>
        </div>

        {/* Portal Tag */}
        <div className="px-5 py-3">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Navigation
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090d16]">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <Link
            href="/student/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Pratinjau Portal Siswa</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors text-xs font-medium text-left w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Log Out)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
