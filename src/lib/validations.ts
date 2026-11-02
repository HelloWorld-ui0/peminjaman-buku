import { z } from "zod";

export const studentLoginSchema = z.object({
  nis: z.string().min(3, "NIS wajib diisi minimal 3 karakter"),
  password: z.string().min(4, "Kata sandi minimal 4 karakter"),
  rememberMe: z.boolean().optional().default(false),
});

export const adminLoginSchema = z.object({
  identifier: z.string().min(3, "Email atau username wajib diisi"),
  password: z.string().min(4, "Kata sandi minimal 4 karakter"),
  rememberMe: z.boolean().optional().default(false),
});

export const bookSchema = z.object({
  title: z.string().min(2, "Judul buku minimal 2 karakter"),
  author: z.string().min(2, "Nama penulis minimal 2 karakter"),
  isbn: z.string().min(5, "ISBN minimal 5 karakter"),
  publisher: z.string().min(2, "Penerbit minimal 2 karakter"),
  publicationYear: z.coerce.number().int().min(1900, "Tahun terbit tidak valid").max(new Date().getFullYear() + 1),
  description: z.string().optional().default(""),
  coverUrl: z.string().url("URL cover harus berupa link valid").or(z.string().startsWith("/")).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  totalStock: z.coerce.number().int().min(1, "Total stok minimal 1"),
  availableStock: z.coerce.number().int().min(0, "Stok tersedia tidak boleh negatif").optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional().default(""),
});

export const studentSchema = z.object({
  name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  nis: z.string().min(4, "NIS minimal 4 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter").optional().or(z.literal("")),
  className: z.string().min(1, "Kelas wajib diisi (contoh: XII MIPA 1)"),
});

export const borrowRequestSchema = z.object({
  bookId: z.string().min(1, "ID buku tidak valid"),
  durationDays: z.coerce.number().int().min(1).max(14).default(7),
});
