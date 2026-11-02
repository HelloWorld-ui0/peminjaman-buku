import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengambil kategori" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const validated = categorySchema.safeParse(body);
    if (!validated.success) {
      const msg = (validated.error as any).issues?.[0]?.message || "Data kategori tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { name: validated.data.name },
    });
    if (existing) {
      return NextResponse.json({ error: "Nama kategori sudah ada" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: validated.data.name,
        description: validated.data.description || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kategori "${category.name}" berhasil ditambahkan.`,
      category,
    });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat kategori" }, { status: 500 });
  }
}
