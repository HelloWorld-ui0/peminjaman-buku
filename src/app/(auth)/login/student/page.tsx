"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickFill = () => {
    setNis("123456");
    setPassword("Student123!");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nis.trim() || !password) {
      setError("Mohon masukkan NIS dan kata sandi Anda.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nis, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "NIS atau kata sandi tidak sesuai.");
        setLoading(false);
        return;
      }

      router.push(data.redirect || "/student/dashboard");
      router.refresh();
    } catch {
      setError("Gagal menghubungi server. Pastikan koneksi berjalan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center px-4 py-12 font-['Inter']">
      <div className="w-full max-w-[420px]">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] p-7 sm:p-9">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#172554] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
                LIBRARYKU
              </h1>
              <p className="text-[11px] text-slate-500">Perpustakaan SMA Harapan Bangsa</p>
            </div>
          </div>

          {/* Role Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
            <div className="py-2 text-center rounded-lg bg-white text-slate-900 shadow-xs font-bold">
              Portal Siswa
            </div>
            <Link
              href="/login/admin"
              className="py-2 text-center rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            >
              Staf / Admin
            </Link>
          </div>

          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Masuk ke Akun Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan Nomor Induk Siswa (NIS) untuk mengakses sirkulasi dan katalog buku.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nomor Induk Siswa (NIS)
              </label>
              <input
                type="text"
                required
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 123456"
                className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 transition-all font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => alert("Silakan hubungi petugas perpustakaan di ruang baca untuk reset kata sandi.")}
                  className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Lupa sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Ingat saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#172554] hover:bg-[#1e3a8a] active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Masuk sebagai Siswa</span>
            </button>
          </form>

          {/* Clean demo credential helper footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 -mx-7 sm:-mx-9 -mb-7 sm:-mb-9 px-7 sm:px-9 py-3 rounded-b-2xl">
            <div className="text-slate-500 text-[11px]">
              <span className="font-medium text-slate-700">Demo Siswa:</span>{" "}
              <span className="font-mono text-slate-600">123456 / Student123!</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          © 2024 LIBRARYKU • Sistem Perpustakaan Sekolah
        </p>
      </div>
    </div>
  );
}
