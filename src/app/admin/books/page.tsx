import React from "react";
import { prisma } from "@/lib/prisma";
import { BooksClient } from "./books-client";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const [books, categories] = await Promise.all([
    prisma.book.findMany({
      include: {
        category: true,
        _count: {
          select: { borrowings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return <BooksClient initialBooks={books} categories={categories} />;
}
