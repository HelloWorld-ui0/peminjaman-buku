import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { studentLoginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = studentLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data input tidak valid" },
        { status: 400 }
      );
    }

    const { nis, password, rememberMe } = parsed.data;

    // Find student by NIS or email
    const student = await prisma.user.findFirst({
      where: {
        OR: [
          { nis: nis.trim() },
          { email: nis.trim().toLowerCase() },
        ],
        role: "STUDENT",
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Nomor Induk Siswa (NIS) atau kata sandi tidak ditemukan." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, student.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Kata sandi yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    // Create session JWT token
    const token = await createSessionToken(
      {
        userId: student.id,
        name: student.name,
        email: student.email,
        role: "STUDENT",
        nis: student.nis,
        className: student.className,
      },
      rememberMe
    );

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    const res = NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${student.name}!`,
      user: {
        id: student.id,
        name: student.name,
        nis: student.nis,
        className: student.className,
        role: student.role,
      },
      redirect: "/student/dashboard",
    });

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return res;
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server. Silakan coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}
