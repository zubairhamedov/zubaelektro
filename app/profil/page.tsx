"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, LogOut, Globe } from "lucide-react";
import { supabase, logout } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";
import BottomTab from "@/components/BottomTab";

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [lessonsDone, setLessonsDone] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { count } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);
      setLessonsDone(count || 0);
    }
    load();
  }, []);

  function getInitials(fullName: string | undefined) {
    if (!fullName) return "?";
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent text-2xl font-bold text-accent">
            {getInitials(profile?.full_name)}
          </div>
          <h1 className="font-display text-xl font-bold">
            {profile?.full_name || "Foydalanuvchi"}
          </h1>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl2 bg-surface p-4 text-center shadow-card">
            <p className="font-display text-xl font-bold text-accent">
              {lessonsDone}
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
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl2 border border-danger/30 bg-danger/10 py-3.5 font-medium text-danger active:opacity-80"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
      <BottomTab />
    </div>
  );
}
