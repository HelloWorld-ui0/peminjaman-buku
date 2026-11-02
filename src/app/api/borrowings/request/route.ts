import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { borrowRequestSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan masuk sebagai siswa." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = borrowRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data pengajuan tidak valid." },
        { status: 400 }
      );
    }

    const { bookId, durationDays } = parsed.data;

    // 1. Check book existence and availability
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Buku tidak ditemukan di katalog." }, { status: 404 });
    }

    if (book.availableStock <= 0) {
      return NextResponse.json(
        { error: "Maaf, eksemplar buku ini sedang habis dipinjam oleh siswa lain." },
        { status: 400 }
      );
    }

    // 2. Check student's current active + pending quota (max 3 books)
    const activeCount = await prisma.borrowing.count({
      where: {
        userId: session.userId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (activeCount >= 3) {
      return NextResponse.json(
        { error: "Batas maksimal peminjaman serentak adalah 3 buku. Selesaikan peminjaman sebelumnya terlebih dahulu." },
        { status: 400 }
      );
    }

    // 3. Prevent duplicate active loan for the same book
    const existingLoan = await prisma.borrowing.findFirst({
      where: {
        userId: session.userId,
        bookId: book.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingLoan) {
      return NextResponse.json(
        { error: "Anda sudah memiliki pengajuan atau peminjaman aktif untuk judul buku ini." },
        { status: 400 }
      );
    }

    // 4. Create PENDING borrowing request (Do NOT decrease availableStock yet!)
    const now = new Date();
    const dueDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const borrowing = await prisma.borrowing.create({
      data: {
        userId: session.userId,
        bookId: book.id,
        borrowDate: now,
        dueDate,
        status: "PENDING",
      },
      include: {
        book: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pengajuan peminjaman \"${book.title}\" berhasil dikirim. Menunggu persetujuan petugas perpustakaan.`,
      borrowing,
    });
  } catch (error: any) {
    console.error("Borrow request error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pengajuan peminjaman." },
      { status: 500 }
    );
  }
}
