import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { studentSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = { role: "STUDENT" };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nis: { contains: search } },
        { email: { contains: search } },
        { className: { contains: search } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: { borrowings: true },
        },
        borrowings: {
          where: { status: "APPROVED" },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengambil data siswa" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const validated = studentSchema.safeParse(body);
    if (!validated.success) {
      const msg = (validated.error as any).issues?.[0]?.message || "Data siswa tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Check unique NIS
    const existingNis = await prisma.user.findUnique({
      where: { nis: validated.data.nis },
    });
    if (existingNis) {
      return NextResponse.json({ error: "NIS sudah terdaftar untuk siswa lain" }, { status: 400 });
    }

    // Check unique Email
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(validated.data.password || "Student123!");

    const student = await prisma.user.create({
      data: {
        name: validated.data.name,
        nis: validated.data.nis,
        email: validated.data.email,
        password: hashedPassword,
        className: validated.data.className,
        role: "STUDENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun siswa ${student.name} (NIS: ${student.nis}) berhasil dibuat.`,
      student: {
        id: student.id,
        name: student.name,
        nis: student.nis,
        email: student.email,
        className: student.className,
      },
    });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: error.message || "Gagal menambahkan akun siswa" }, { status: 500 });
  }
}
