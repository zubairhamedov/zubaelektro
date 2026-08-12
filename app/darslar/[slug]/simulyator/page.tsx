"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SimulatorCanvas from "@/components/simulator/SimulatorCanvas";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function SimulyatorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { lessons, refreshProgress } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const lesson = lessons.find((l) => l.slug === slug);

  async function handleSuccess() {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user && lesson) {
      await supabase.from("user_progress").upsert({
        user_id: userData.user.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      refreshProgress();
    }
    setShowSuccess(true);
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-textSecondary"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Orqaga</span>
        </button>
        <h1 className="ml-2 font-display text-base font-semibold">
          {lesson?.title || "Simulyator"}
        </h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <SimulatorCanvas taskSlug={slug} onSuccess={handleSuccess} />
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-xs rounded-xl2 bg-surface p-6 text-center shadow-card">
            <p className="font-display text-lg font-bold text-success">
              Dars bajarildi! 🎉
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              Zanjirni to'g'ri yig'dingiz.
            </p>
            <button
              onClick={() => router.push(`/darslar/${slug}`)}
              className="mt-5 w-full rounded-xl2 bg-accent py-3 font-display font-semibold text-bg active:opacity-80"
            >
              Darsga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
