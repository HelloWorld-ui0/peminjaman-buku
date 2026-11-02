"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PendingActionProps {
  borrowingId: string;
  bookTitle: string;
  studentName: string;
}

export function PendingActionButtons({ borrowingId, bookTitle, studentName }: PendingActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    if (
      !confirm(
        action === "approve"
          ? `Setujui peminjaman buku "${bookTitle}" oleh ${studentName}? Stok akan berkurang 1.`
          : `Tolak permohonan peminjaman buku "${bookTitle}" oleh ${studentName}?`
      )
    ) {
      return;
    }

    setLoading(action);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/borrowings/${borrowingId}/${action}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses aksi");
      }

      setStatusMessage(action === "approve" ? "Disetujui" : "Ditolak");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Gagal memproses transaksi");
    } finally {
      setLoading(null);
    }
  };

  if (statusMessage) {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          statusMessage === "Disetujui"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-600"
        }`}
      >
        {statusMessage}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
        title="Setujui Peminjaman"
      >
        {loading === "approve" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
        title="Tolak Peminjaman"
      >
        {loading === "reject" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
