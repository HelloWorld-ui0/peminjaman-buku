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
      return NextResponse.json({ error: "Akses ditolak. Hanya petugas perpustakaan yang dapat memproses pengembalian buku." }, { status: 403 });
    }

    const { id } = await params;

    // Use Prisma transaction to atomically update status and increment book stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch borrowing record and verify status
      const borrowing = await tx.borrowing.findUnique({
        where: { id },
        include: { book: true, user: true },
      });

      if (!borrowing) {
        throw new Error("Data transaksi peminjaman tidak ditemukan.");
      }

      if (borrowing.status !== "APPROVED") {
        if (borrowing.status === "RETURNED") {
          throw new Error("Buku ini sudah berstatus DIKEMBALIKAN sebelumnya. Pengembalian ganda dicegah.");
        }
        throw new Error(`Pengembalian tidak dapat diproses karena status buku saat ini adalah ${borrowing.status}.`);
      }

      // 2. Increment book available stock (cannot exceed totalStock)
      const currentBook = await tx.book.findUnique({
        where: { id: borrowing.bookId },
      });

      if (!currentBook) {
        throw new Error("Data buku terkait tidak ditemukan.");
      }

      const newAvailable = Math.min(currentBook.totalStock, currentBook.availableStock + 1);

      const updatedBook = await tx.book.update({
        where: { id: borrowing.bookId },
        data: {
          availableStock: newAvailable,
        },
      });

      // 3. Update borrowing record
      const updatedBorrowing = await tx.borrowing.update({
        where: { id },
        data: {
          status: "RETURNED",
          returnedAt: new Date(),
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
      message: `Buku "${result.updatedBorrowing.book.title}" berhasil diterima dari ${result.updatedBorrowing.user.name}. Stok buku kini tersedia: ${result.updatedBook.availableStock}/${result.updatedBook.totalStock} eksemplar.`,
      borrowing: result.updatedBorrowing,
    });
  } catch (error: any) {
    console.error("Error returning borrowing:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses pengembalian buku" },
      { status: 400 }
    );
  }
}
