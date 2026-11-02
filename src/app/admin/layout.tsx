import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Count pending borrowings
  const pendingCount = await prisma.borrowing.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <AdminSidebar adminName={session?.name} />
      <div className="pl-72 flex flex-col min-h-screen">
        <AdminHeader adminName={session?.name} pendingCount={pendingCount} />
        <main className="pt-16 p-6 sm:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
