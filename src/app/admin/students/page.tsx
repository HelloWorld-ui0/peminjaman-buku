import React from "react";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./students-client";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      _count: {
        select: { borrowings: true },
      },
      borrowings: {
        include: {
          book: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const serialized = students.map((s) => ({
    id: s.id,
    name: s.name,
    nis: s.nis || "",
    email: s.email,
    className: s.className || "Umum",
    createdAt: s.createdAt.toISOString(),
    _count: s._count,
    borrowings: s.borrowings.map((b) => ({
      id: b.id,
      status: b.status,
      borrowDate: b.borrowDate.toISOString(),
      dueDate: b.dueDate.toISOString(),
      book: {
        title: b.book.title,
        isbn: b.book.isbn,
      },
    })),
  }));

  return <StudentsClient initialStudents={serialized} />;
}
