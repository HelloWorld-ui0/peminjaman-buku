import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentHeader } from "@/components/layout/student-header";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Fetch upcoming due loan for this student if any
  let urgentDueText = "";
  if (session?.userId) {
    const activeLoan = await prisma.borrowing.findFirst({
      where: {
        userId: session.userId,
        status: "APPROVED",
      },
      orderBy: { dueDate: "asc" },
      include: { book: true },
    });

    if (activeLoan) {
      const now = new Date();
      const diffTime = activeLoan.dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        urgentDueText = "Buku terlambat dikembalikan!";
      } else {
        urgentDueText = `Pengembalian: ${diffDays} hari lagi (${activeLoan.book.title.slice(0, 18)}...)`;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <StudentSidebar userName={session?.name} nis={session?.nis} />
      <div className="pl-72 flex flex-col min-h-screen">
        <StudentHeader
          userName={session?.name}
          nis={session?.nis}
          urgentDueText={urgentDueText}
        />
        <main className="pt-16 p-6 sm:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
