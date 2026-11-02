import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminBorrowingsClient } from "./borrowings-client";

export const dynamic = "force-dynamic";

export default async function AdminBorrowingsPage() {
  const borrowings = await prisma.borrowing.findMany({
    include: {
      user: true,
      book: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = borrowings.map((b) => ({
    id: b.id,
    borrowDate: b.borrowDate.toISOString(),
    dueDate: b.dueDate.toISOString(),
    approvedAt: b.approvedAt ? b.approvedAt.toISOString() : null,
    returnedAt: b.returnedAt ? b.returnedAt.toISOString() : null,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    user: {
      id: b.user.id,
      name: b.user.name,
      nis: b.user.nis,
      email: b.user.email,
      className: b.user.className,
    },
    book: {
      id: b.book.id,
      title: b.book.title,
      author: b.book.author,
      isbn: b.book.isbn,
      coverUrl: b.book.coverUrl,
      availableStock: b.book.availableStock,
      totalStock: b.book.totalStock,
      category: {
        name: b.book.category.name,
      },
    },
  }));

  return <AdminBorrowingsClient initialBorrowings={serialized} />;
}
