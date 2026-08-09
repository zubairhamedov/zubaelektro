"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  phone: string;
} | null;

type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  is_pro: boolean;
};

type Test = {
  id: string;
  slug: string;
  title: string;
  question_count: number;
};

type AppContextValue = {
  profile: Profile;
  lessons: Lesson[];
  tests: Test[];
  totalLessons: number;
  completedCount: number;
  completedLessonIds: Set<string>;
  nextLesson: Lesson | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshProgress: () => Promise<void>;
};

const AppContext = createContext<AppContextValue>({
  profile: null,
  lessons: [],
  tests: [],
  totalLessons: 0,
  completedCount: 0,
  completedLessonIds: new Set(),
  nextLesson: null,
  loading: true,
  refreshProfile: async () => {},
  refreshProgress: async () => {},
});

export function useAuth() {
  return useContext(AppContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const [profileRes, lessonsRes, testsRes] = await Promise.all([
      user
        ? supabase.from("user_profiles").select("*").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
      supabase.from("lessons").select("*").order("order_index", { ascending: true }),
      supabase.from("tests").select("*"),
    ]);

    setProfile((profileRes as any).data);
    const lessonsData = (lessonsRes.data || []) as Lesson[];
    setLessons(lessonsData);
    setTests((testsRes.data || []) as Test[]);

    if (user) {
      const { data: progress } = await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .eq("completed", true);
      const completedIds = new Set((progress || []).map((p) => p.lesson_id));
      setCompletedCount(completedIds.size);
      setCompletedLessonIds(completedIds);
      const next =
        lessonsData.find((l) => !completedIds.has(l.id)) ||
        lessonsData[lessonsData.length - 1] ||
        null;
      setNextLesson(next);
    } else {
      setCompletedCount(0);
      setCompletedLessonIds(new Set());
      setNextLesson(lessonsData[0] || null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadAll();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        lessons,
        tests,
        totalLessons: lessons.length,
        completedCount,
        completedLessonIds,
        nextLesson,
        loading,
        refreshProfile: loadAll,
        refreshProgress: loadAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
