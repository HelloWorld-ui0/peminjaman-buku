import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bookSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const validated = bookSchema.safeParse(body);
    if (!validated.success) {
      const msg = (validated.error as any).issues?.[0]?.message || "Data buku tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const currentBook = await prisma.book.findUnique({ where: { id } });
    if (!currentBook) {
      return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
    }

    // Check ISBN uniqueness if changed
    if (validated.data.isbn !== currentBook.isbn) {
      const existing = await prisma.book.findUnique({
        where: { isbn: validated.data.isbn },
      });
      if (existing) {
        return NextResponse.json({ error: "ISBN buku sudah digunakan oleh buku lain" }, { status: 400 });
      }
    }

    // Calculate availableStock based on borrowed diff
    const borrowedCount = currentBook.totalStock - currentBook.availableStock;
    const newTotalStock = validated.data.totalStock;
    if (newTotalStock < borrowedCount) {
      return NextResponse.json(
        { error: `Total stok tidak boleh kurang dari jumlah buku yang sedang dipinjam (${borrowedCount} buku).` },
        { status: 400 }
      );
    }
    const newAvailableStock = Math.max(0, newTotalStock - borrowedCount);

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title: validated.data.title,
        author: validated.data.author,
        isbn: validated.data.isbn,
        publisher: validated.data.publisher,
        publicationYear: validated.data.publicationYear,
        description: validated.data.description,
        coverUrl: validated.data.coverUrl || null,
        categoryId: validated.data.categoryId,
        totalStock: newTotalStock,
        availableStock: newAvailableStock,
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message: `Data buku "${updated.title}" berhasil diperbarui.`,
      book: updated,
    });
  } catch (error: any) {
    console.error("Error updating book:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui buku" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrowings: {
          where: {
            status: { in: ["PENDING", "APPROVED"] },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
    }

    // Prevent deleting a book that has active borrowing transactions
    if (book.borrowings.length > 0) {
      return NextResponse.json(
        {
          error: `Buku "${book.title}" tidak dapat dihapus karena masih memiliki ${book.borrowings.length} transaksi peminjaman aktif atau pending!`,
        },
        { status: 400 }
      );
    }

    // Delete any past history if needed or cascade
    await prisma.borrowing.deleteMany({ where: { bookId: id } });
    await prisma.book.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Buku "${book.title}" berhasil dihapus dari perpustakaan.`,
    });
  } catch (error: any) {
    console.error("Error deleting book:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus buku" }, { status: 500 });
  }
}
