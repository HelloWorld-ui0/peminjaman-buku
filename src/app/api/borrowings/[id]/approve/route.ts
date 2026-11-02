import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hanya staf perpustakaan yang diizinkan." }, { status: 403 });
    }

    const { id } = await params;

    // Use Prisma transaction to guarantee atomicity and stock consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current borrowing record
      const borrowing = await tx.borrowing.findUnique({
        where: { id },
        include: { book: true, user: true },
      });

      if (!borrowing) {
        throw new Error("Data transaksi peminjaman tidak ditemukan.");
      }

      if (borrowing.status !== "PENDING") {
        throw new Error(`Transaksi tidak dapat disetujui karena status saat ini adalah ${borrowing.status}.`);
      }

      // 2. Check stock availability
      if (borrowing.book.availableStock <= 0) {
        throw new Error(`Stok buku "${borrowing.book.title}" sudah habis (0 eksemplar tersedia).`);
      }

      // 3. Atomically decrement book available stock (with conditional check)
      const updatedBook = await tx.book.update({
        where: {
          id: borrowing.bookId,
          availableStock: { gt: 0 },
        },
        data: {
          availableStock: { decrement: 1 },
        },
      });

      // 4. Update borrowing status to APPROVED
      const updatedBorrowing = await tx.borrowing.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
        include: {
          book: true,
          user: true,
        },
      });

      return { updatedBorrowing, updatedBook };
    });

    return NextResponse.json({
      success: true,
      message: `Peminjaman buku "${result.updatedBorrowing.book.title}" oleh ${result.updatedBorrowing.user.name} berhasil disetujui. Sisa stok: ${result.updatedBook.availableStock}`,
      borrowing: result.updatedBorrowing,
    });
  } catch (error: any) {
    console.error("Error approving borrowing:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyetujui peminjaman buku" },
      { status: 400 }
    );
  }
}
