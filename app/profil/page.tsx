"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, LogOut, Globe, Pencil } from "lucide-react";
import { logout } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import BottomTab from "@/components/BottomTab";

export default function ProfilPage() {
  const router = useRouter();
  const { profile, completedCount, loading } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function getInitials(fullName: string | undefined) {
    if (!fullName) return "?";
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }

  async function handleConfirmLogout() {
    setLoggingOut(true);
    await logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent text-2xl font-bold text-accent">
            {loading ? "" : getInitials(profile?.full_name)}
          </div>
          <h1 className="font-display text-xl font-bold">
            {loading ? "\u00A0" : profile?.full_name || "Foydalanuvchi"}
          </h1>
          <Link
            href="/profil/tahrirlash"
            className="flex items-center gap-1.5 text-sm text-accent"
          >
            <Pencil size={14} />
            Tahrirlash
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl2 bg-surface p-4 text-center shadow-card">
            <p className="font-display text-xl font-bold text-accent">
              {completedCount}
            </p>
            <p className="text-xs text-textSecondary">Darslar</p>
          </div>
          <div className="rounded-xl2 bg-surface p-4 text-center shadow-card">
            <p className="font-display text-xl font-bold text-accent">0</p>
            <p className="text-xs text-textSecondary">Testlar</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-textSecondary" />
            <div>
              <p className="text-xs text-textSecondary">Telefon</p>
              <p className="text-sm">{profile?.phone || "-"}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-textSecondary" />
            <span className="text-sm">Til</span>
          </div>
          <span className="text-sm text-textSecondary">O'zbekcha</span>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl2 border border-danger/30 bg-danger/10 py-3.5 font-medium text-danger active:opacity-80"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
      <BottomTab />

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-xs rounded-xl2 bg-surface p-6 text-center shadow-card">
            <p className="font-display text-lg font-semibold">
              Hisobdan chiqmoqchimisiz?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl2 border border-white/10 py-3 font-medium text-textPrimary active:bg-surfaceHover"
              >
                Yo'q
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="flex-1 rounded-xl2 bg-danger py-3 font-medium text-white active:opacity-80 disabled:opacity-60"
              >
                {loggingOut ? "..." : "Ha"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
