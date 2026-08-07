"use client";

import { useEffect, useState } from "react";
import { Phone, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BottomTab from "@/components/BottomTab";

export default function ProfilPage() {
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

  const initial = profile?.full_name?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent text-2xl font-bold text-accent">
            {initial}
          </div>
          <h1 className="font-display text-xl font-bold">
            {profile?.full_name || "Foydalanuvchi"}
          </h1>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
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
          <div className="rounded-xl2 bg-surface p-4 text-center shadow-card">
            <p className="font-display text-xl font-bold text-accent">1</p>
            <p className="text-xs text-textSecondary">Daqiqa</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl2 bg-surface p-4 shadow-card">
          <Phone size={18} className="text-textSecondary" />
          <div>
            <p className="text-xs text-textSecondary">Telefon</p>
            <p className="text-sm">{profile?.phone || "-"}</p>
          </div>
        </div>

        <Link
          href="/sozlamalar"
          className="mt-4 flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card active:bg-surfaceHover"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-textSecondary" />
            <span className="text-sm">Sozlamalar</span>
          </div>
          <ChevronRight size={18} className="text-textSecondary" />
        </Link>
      </div>
      <BottomTab />
    </div>
  );
}
