import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data input tidak valid" },
        { status: 400 }
      );
    }

    const { identifier, password, rememberMe } = parsed.data;
    const cleanId = identifier.trim().toLowerCase();

    // Find admin by email or name (contains)
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { name: { contains: identifier.trim() } },
        ],
        role: "ADMIN",
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Akun administrator/pustakawan tidak terdaftar." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Kata sandi administrator salah." },
        { status: 401 }
      );
    }

    // Create session JWT token
    const token = await createSessionToken(
      {
        userId: admin.id,
        name: admin.name,
        email: admin.email,
        role: "ADMIN",
      },
      rememberMe
    );

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    const res = NextResponse.json({
      success: true,
      message: `Selamat datang, ${admin.name}!`,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      redirect: "/admin/dashboard",
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
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat login admin." },
      { status: 500 }
    );
  }
}
