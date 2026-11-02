import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

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

    const validated = categorySchema.safeParse(body);
    if (!validated.success) {
      const msg = (validated.error as any).issues?.[0]?.message || "Data kategori tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (validated.data.name !== current.name) {
      const existing = await prisma.category.findUnique({
        where: { name: validated.data.name },
      });
      if (existing) {
        return NextResponse.json({ error: "Nama kategori sudah digunakan" }, { status: 400 });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        description: validated.data.description || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kategori "${updated.name}" berhasil diperbarui.`,
      category: updated,
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui kategori" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    // Prevent deletion when a category still contains books
    if (category._count.books > 0) {
      return NextResponse.json(
        {
          error: `Kategori "${category.name}" tidak dapat dihapus karena masih memuat ${category._count.books} buku terdaftar! Pindahkan atau hapus buku tersebut terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Kategori "${category.name}" berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus kategori" }, { status: 500 });
  }
}
