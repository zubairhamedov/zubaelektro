"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { refreshProgress } = useAuth();

  const [lesson, setLesson] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLesson() {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("slug", slug)
        .single();
      setLesson(data);
      setLoading(false);
    }
    if (slug) fetchLesson();
  }, [slug]);

  async function markComplete() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user || !lesson) return;
    await supabase.from("user_progress").upsert({
      user_id: userData.user.id,
      lesson_id: lesson.id,
      completed: true,
      completed_at: new Date().toISOString(),
    });
    setCompleted(true);
    refreshProgress();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-textSecondary">
        Yuklanmoqda...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-textSecondary">Dars topilmadi.</p>
        <button onClick={() => router.back()} className="text-accent">
          Orqaga
        </button>
      </div>
    );
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

        <h1 className="font-display text-2xl font-bold">{lesson.title}</h1>
        <p className="mt-1 text-sm text-textSecondary">
          {lesson.description}
        </p>

        <div className="mt-6 whitespace-pre-line rounded-xl2 bg-surface p-5 leading-relaxed text-textPrimary shadow-card">
          {lesson.content}
        </div>

        <button
          onClick={markComplete}
          disabled={completed}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl2 bg-accent py-3.5 font-display font-semibold text-bg active:opacity-80 disabled:opacity-60"
        >
          <CheckCircle2 size={20} />
          {completed ? "Bajarildi" : "Darsni tugatish"}
        </button>
      </div>
    </div>
  );
}
