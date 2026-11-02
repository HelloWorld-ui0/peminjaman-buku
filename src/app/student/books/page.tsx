import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, BookOpen, Layers, CheckCircle, ArrowRight, Grid, List, Sparkles } from "lucide-react";
import { BookCatalogClient } from "./catalog-client";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    available?: string;
    page?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function StudentBooksPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.trim() || "";
  const selectedCategory = resolvedParams.category || "";
  const availableOnly = resolvedParams.available === "true";
  const currentPage = parseInt(resolvedParams.page || "1", 10) || 1;
  const pageSize = 9;

  // 1. Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // 2. Build where filter
  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
      { isbn: { contains: q } },
    ];
  }

  if (selectedCategory) {
    where.categoryId = selectedCategory;
  }

  if (availableOnly) {
    where.availableStock = { gt: 0 };
  }

  // 3. Total count & books
  const totalBooks = await prisma.book.count({ where });
  const totalAvailable = await prisma.book.count({ where: { availableStock: { gt: 0 } } });
  const totalTitlesAll = await prisma.book.count();

  const books = await prisma.book.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const totalPages = Math.ceil(totalBooks / pageSize) || 1;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Repository Statistics Banner (Exact Stitch Styling) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#000f3f] text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-800/60">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>SMA Harapan Bangsa Digital Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
              Katalog & Eksplorasi Buku
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Cari dan temukan koleksi perpustakaan untuk referensi akademik kurikulum merdeka, literasi sains, sastra, dan persiapan ujian.
            </p>
          </div>

          {/* Quick Stats Group */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <div className="text-center px-2">
              <span className="block text-xl font-bold font-['Plus_Jakarta_Sans'] text-white">
                {totalTitlesAll}
              </span>
              <span className="block text-[11px] text-slate-300">Total Judul</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <span className="block text-xl font-bold font-['Plus_Jakarta_Sans'] text-blue-300">
                {totalAvailable}
              </span>
              <span className="block text-[11px] text-slate-300">Tersedia di Rak</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <span className="block text-xl font-bold font-['Plus_Jakarta_Sans'] text-emerald-400">
                98%
              </span>
              <span className="block text-[11px] text-slate-300">Sirkulasi Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Catalog Component (Search, Filters, Grid, and Modal) */}
      <BookCatalogClient
        books={books}
        categories={categories}
        totalBooks={totalBooks}
        currentPage={currentPage}
        totalPages={totalPages}
        initialQuery={q}
        initialCategory={selectedCategory}
        initialAvailableOnly={availableOnly}
      />
    </div>
  );
}
