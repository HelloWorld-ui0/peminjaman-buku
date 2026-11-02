"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  History,
  BookOpen,
} from "lucide-react";

interface StudentBorrowing {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  borrowDate: string;
  dueDate: string;
  book: {
    title: string;
    isbn: string;
  };
}

interface StudentItem {
  id: string;
  name: string;
  nis: string;
  email: string;
  className: string;
  createdAt: string;
  _count: {
    borrowings: number;
  };
  borrowings: StudentBorrowing[];
}

interface StudentsClientProps {
  initialStudents: StudentItem[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [viewHistoryStudent, setViewHistoryStudent] = useState<StudentItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    nis: "",
    email: "",
    className: "XII MIPA 1",
    password: "Student123!",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    const randomNis = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData({
      name: "",
      nis: randomNis,
      email: `siswa.${randomNis}@sekolah.sch.id`,
      className: "XII MIPA 1",
      password: "Student123!",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nis: student.nis,
      email: student.email,
      className: student.className,
      password: "", // Leave blank if not changing
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data siswa");
      }

      showToast(data.message || "Data siswa berhasil disimpan!");
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (student: StudentItem) => {
    if (!confirm(`Hapus akun siswa "${student.name}" (NIS: ${student.nis})?`)) return;

    setIsDeletingId(student.id);
    try {
      const res = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus siswa");
      }
      showToast(data.message || "Siswa berhasil dihapus!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const filtered = initialStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase())
  );

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
            Manajemen Anggota Siswa
          </h1>
          <p className="text-xs text-slate-500">
            Kelola data akun siswa, Nomor Induk Siswa (NIS), kelas, dan kredensial login portal.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa Baru</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa, NIS, atau kelas..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Total: <strong>{initialStudents.length}</strong> Siswa Terdaftar
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nama & NIS</th>
                <th className="px-4 py-3.5">Kelas</th>
                <th className="px-4 py-3.5">Email Akun</th>
                <th className="px-4 py-3.5 text-center">Pinjaman Aktif</th>
                <th className="px-4 py-3.5 text-center">Total Riwayat</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada siswa yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const activeCount = student.borrowings.filter((b) => b.status === "APPROVED").length;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block font-['Plus_Jakarta_Sans']">
                              {student.name}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 block">
                              NIS: {student.nis}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {student.className}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {student.email}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            activeCount > 0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {activeCount} Buku
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => setViewHistoryStudent(student)}
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          {student._count.borrowings} Transaksi ↗
                        </button>
                      </td>

                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewHistoryStudent(student)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Lihat Riwayat Peminjaman"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            disabled={isDeletingId === student.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Hapus Akun Siswa"
                          >
                            {isDeletingId === student.id ? (
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    {editingStudent ? "Edit Akun Siswa" : "Tambah Siswa Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-500">Kredensial dan profil anggota perpustakaan</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Induk (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="123456"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="XII RPL 1"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Siswa *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="siswa@sekolah.sch.id"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingStudent ? "Ubah Password (Kosongkan jika tetap)" : "Password Login Siswa *"}
                </label>
                <input
                  type="text"
                  required={!editingStudent}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingStudent ? "••••••••" : "Minimal 6 karakter"}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                {!editingStudent && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Password bawaan otomatis: <strong className="text-slate-700">Student123!</strong>
                  </span>
                )}
              </div>

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
                  <span>{editingStudent ? "Simpan Perubahan" : "Daftarkan Siswa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Student Borrowing History */}
      {viewHistoryStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Riwayat Peminjaman Siswa
                </h3>
                <p className="text-[11px] text-slate-500">
                  {viewHistoryStudent.name} • NIS: {viewHistoryStudent.nis}
                </p>
              </div>
              <button
                onClick={() => setViewHistoryStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {viewHistoryStudent.borrowings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Siswa ini belum memiliki riwayat peminjaman buku.
                </div>
              ) : (
                viewHistoryStudent.borrowings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{b.book.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Pinjam: {new Date(b.borrowDate).toLocaleDateString("id-ID")} • Jatuh Tempo:{" "}
                        {new Date(b.dueDate).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === "APPROVED"
                          ? "bg-blue-50 text-blue-700"
                          : b.status === "RETURNED"
                          ? "bg-emerald-50 text-emerald-700"
                          : b.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
