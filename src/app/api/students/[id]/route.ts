import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

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

    const current = await prisma.user.findUnique({ where: { id } });
    if (!current || current.role !== "STUDENT") {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    // Check unique NIS
    if (body.nis && body.nis !== current.nis) {
      const existingNis = await prisma.user.findUnique({ where: { nis: body.nis } });
      if (existingNis) {
        return NextResponse.json({ error: "NIS sudah terdaftar untuk siswa lain" }, { status: 400 });
      }
    }

    // Check unique Email
    if (body.email && body.email !== current.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: body.email } });
      if (existingEmail) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
      }
    }

    const updateData: any = {
      name: body.name,
      nis: body.nis,
      email: body.email,
      className: body.className,
    };

    if (body.password && body.password.trim() !== "") {
      updateData.password = await hashPassword(body.password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Data siswa ${updated.name} berhasil diperbarui.`,
      student: updated,
    });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui data siswa" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;

    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        borrowings: {
          where: { status: { in: ["PENDING", "APPROVED"] } },
        },
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    if (student.borrowings.length > 0) {
      return NextResponse.json(
        {
          error: `Siswa "${student.name}" tidak dapat dihapus karena masih memiliki ${student.borrowings.length} peminjaman aktif/pending!`,
        },
        { status: 400 }
      );
    }

    // Delete borrowings history or cascade
    await prisma.borrowing.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Akun siswa "${student.name}" berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus siswa" }, { status: 500 });
  }
}
