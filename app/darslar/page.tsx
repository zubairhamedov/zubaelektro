"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BottomTab from "@/components/BottomTab";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  is_pro: boolean;
};

const filters = [
  { key: "hammasi", label: "Hammasi" },
  { key: "asoslar", label: "Asoslar" },
  { key: "ilgor", label: "Ilg'or" },
  { key: "amaliy", label: "Amaliy" },
];

export default function DarslarPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeFilter, setActiveFilter] = useState("hammasi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });
      setLessons(data || []);
      setLoading(false);
    }
    fetchLessons();
  }, []);

  const filtered =
    activeFilter === "hammasi"
      ? lessons
      : lessons.filter((l) => l.category === activeFilter);

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="font-display text-2xl font-bold">Darslar</h1>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === f.key
                  ? "bg-accent text-bg"
                  : "border border-white/10 text-textSecondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {loading && (
            <p className="py-10 text-center text-textSecondary">
              Yuklanmoqda...
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <p className="py-10 text-center text-textSecondary">
              Bu bo'limda hali darslar yo'q.
            </p>
          )}

          {filtered.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/darslar/${lesson.slug}`}
              className="flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card active:bg-surfaceHover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-white/5 text-accent">
                  {lesson.is_pro ? (
                    <Lock size={18} />
                  ) : (
                    <PlayCircle size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-xs text-textSecondary">
                    {lesson.description}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-textSecondary" />
            </Link>
          ))}
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
