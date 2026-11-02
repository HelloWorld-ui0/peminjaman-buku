import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bookSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
      ];
    }
    if (categoryId && categoryId !== "ALL") {
      where.categoryId = categoryId;
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { borrowings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, books });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengambil data buku" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const validated = bookSchema.safeParse(body);
    if (!validated.success) {
      const msg = (validated.error as any).issues?.[0]?.message || "Data buku tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Check ISBN uniqueness
    const existing = await prisma.book.findUnique({
      where: { isbn: validated.data.isbn },
    });
    if (existing) {
      return NextResponse.json({ error: "ISBN buku sudah terdaftar di sistem" }, { status: 400 });
    }

    // Check Category exists
    const category = await prisma.category.findUnique({
      where: { id: validated.data.categoryId },
    });
    if (!category) {
      return NextResponse.json({ error: "Kategori yang dipilih tidak valid" }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: {
        title: validated.data.title,
        author: validated.data.author,
        isbn: validated.data.isbn,
        publisher: validated.data.publisher,
        publicationYear: validated.data.publicationYear,
        description: validated.data.description,
        coverUrl: validated.data.coverUrl || null,
        categoryId: validated.data.categoryId,
        totalStock: validated.data.totalStock,
        availableStock: validated.data.totalStock, // Initially all copies are available
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message: `Buku "${book.title}" berhasil ditambahkan ke katalog perpustakaan.`,
      book,
    });
  } catch (error: any) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: error.message || "Gagal menambahkan buku" }, { status: 500 });
  }
}
