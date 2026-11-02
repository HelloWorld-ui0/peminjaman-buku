"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  History,
  ArrowLeftRight,
  LogOut,
  Sparkles,
} from "lucide-react";

interface StudentSidebarProps {
  userName?: string;
  nis?: string | null;
}

export function StudentSidebar({ userName = "Ahmad Rayhan", nis = "123456" }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login/student");
      router.refresh();
    } catch (e) {
      router.push("/login/student");
    }
  };

  const navItems = [
    {
      label: "Overview",
      href: "/student/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/student/dashboard",
    },
    {
      label: "Explore Books",
      href: "/student/books",
      icon: BookOpen,
      active: pathname.startsWith("/student/books"),
    },
    {
      label: "My Borrowings",
      href: "/student/borrowings",
      icon: Bookmark,
      active: pathname === "/student/borrowings",
    },
    {
      label: "Borrowing History",
      href: "/student/history",
      icon: History,
      active: pathname === "/student/history",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col justify-between border-r border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#172554] flex items-center justify-center text-white font-bold text-base shadow-sm">
            LK
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base text-[#172554] tracking-tight font-['Plus_Jakarta_Sans']">
              LIBRARYKU
            </span>
            <span className="text-[11px] text-slate-500 font-medium">SMA Harapan Bangsa</span>
          </div>
        </div>

        {/* Portal Tag */}
        <div className="px-5 py-3">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Student Portal
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
                    ? "bg-[#172554] text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? "text-blue-300" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-1">
          <Link
            href="/login/admin"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Switch to Staff</span>
            </div>
            <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
              Librarian
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-xs font-medium text-left w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
