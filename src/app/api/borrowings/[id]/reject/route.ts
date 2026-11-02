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

    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
      include: { book: true, user: true },
    });

    if (!borrowing) {
      return NextResponse.json({ error: "Data transaksi tidak ditemukan" }, { status: 404 });
    }

    if (borrowing.status !== "PENDING") {
      return NextResponse.json(
        { error: `Hanya permohonan berstatus PENDING yang dapat ditolak. Status saat ini: ${borrowing.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.borrowing.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
      include: {
        book: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Permohonan peminjaman buku "${updated.book.title}" oleh ${updated.user.name} berhasil ditolak.`,
      borrowing: updated,
    });
  } catch (error: any) {
    console.error("Error rejecting borrowing:", error);
    return NextResponse.json({ error: error.message || "Gagal menolak permohonan peminjaman" }, { status: 500 });
  }
}
