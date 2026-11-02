import React from "react";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { books: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const serialized = categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
    _count: c._count,
  }));

  return <CategoriesClient initialCategories={serialized} />;
}
