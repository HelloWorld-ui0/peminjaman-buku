import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "libraryku_super_secret_jwt_key_2024_vocational_high_school_token";
const encodedKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "libraryku_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: { role: "ADMIN" | "STUDENT"; userId: string; name: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
      session = payload as any;
    } catch (e) {
      session = null;
    }
  }

  // Redirect root to student login or user's dashboard
  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL(session.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login/student", request.url));
  }

  // If user is already logged in and attempts to access login pages, redirect to respective dashboard
  if (pathname.startsWith("/login")) {
    if (session) {
      const target = session.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect Student routes
  if (pathname.startsWith("/student")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login/student", request.url));
    }
    if (session.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/admin/:path*",
    "/student/:path*",
  ],
};
