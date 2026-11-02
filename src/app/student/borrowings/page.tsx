import React from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { BorrowingsClient } from "./borrowings-client";

export const dynamic = "force-dynamic";

export default async function StudentBorrowingsPage() {
  const session = await getSession();

  let borrowings: any[] = [];
  if (session?.userId) {
    borrowings = await prisma.borrowing.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Serialize dates for client
  const serialized = borrowings.map((b) => ({
    id: b.id,
    borrowDate: b.borrowDate.toISOString(),
    dueDate: b.dueDate.toISOString(),
    approvedAt: b.approvedAt ? b.approvedAt.toISOString() : null,
    returnedAt: b.returnedAt ? b.returnedAt.toISOString() : null,
    status: b.status,
    book: {
      id: b.book.id,
      title: b.book.title,
      author: b.book.author,
      publisher: b.book.publisher,
      isbn: b.book.isbn,
      coverUrl: b.book.coverUrl,
      category: {
        name: b.book.category.name,
      },
    },
  }));

  return (
    <BorrowingsClient
      borrowings={serialized}
      studentName={session?.name || "Siswa"}
      studentNis={session?.nis || "123456"}
    />
  );
}
