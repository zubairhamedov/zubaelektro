"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Globe, Info, HelpCircle } from "lucide-react";
import { logout } from "@/lib/supabase";

export default function SozlamalarPage() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-md px-5 pt-8">
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 text-textSecondary"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Orqaga</span>
        </button>

        <h1 className="font-display text-2xl font-bold">Sozlamalar</h1>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-textSecondary" />
              <span className="text-sm">Til</span>
            </div>
            <span className="text-sm text-textSecondary">O'zbekcha</span>
          </div>

          <div className="flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-textSecondary" />
              <span className="text-sm">Ilova haqida</span>
            </div>
            <span className="text-sm text-textSecondary">
              ZubaElektro v1.0
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-textSecondary" />
              <span className="text-sm">Yordam</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl2 border border-danger/30 bg-danger/10 py-3.5 font-medium text-danger active:opacity-80"
          >
            <LogOut size={18} />
            Chiqish
          </button>
        </div>
      </div>
    </div>
  );
}
