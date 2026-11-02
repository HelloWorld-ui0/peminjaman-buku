import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;

    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
      include: { book: true, user: true },
    });

    if (!borrowing) {
      return NextResponse.json({ error: "Data peminjaman tidak ditemukan" }, { status: 404 });
    }

    // Role check: Only the student who borrowed it or an admin can extend
    if (session.role === "STUDENT" && borrowing.userId !== session.userId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    if (borrowing.status !== "APPROVED") {
      return NextResponse.json(
        { error: `Perpanjangan hanya berlaku untuk status AKTIF/DISETUJUI (Status saat ini: ${borrowing.status})` },
        { status: 400 }
      );
    }

    // Extend due date by 7 days
    const currentDue = new Date(borrowing.dueDate);
    const newDueDate = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updated = await prisma.borrowing.update({
      where: { id },
      data: {
        dueDate: newDueDate,
      },
      include: {
        book: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Masa pinjam buku "${updated.book.title}" berhasil diperpanjang 7 hari sampai ${newDueDate.toLocaleDateString("id-ID")}`,
      borrowing: updated,
    });
  } catch (error: any) {
    console.error("Error extending borrowing:", error);
    return NextResponse.json({ error: error.message || "Gagal memperpanjang masa pinjam" }, { status: 500 });
  }
}
