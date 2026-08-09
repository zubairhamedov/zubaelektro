"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, PlayCircle } from "lucide-react";
import { getCachedLessons, fetchLessons } from "@/lib/cache";
import BottomTab from "@/components/BottomTab";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  is_pro: boolean;
};

export default function DarslarPage() {
  const cached = getCachedLessons();
  const [lessons, setLessons] = useState<Lesson[]>(cached || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    fetchLessons().then((data) => {
      setLessons(data as Lesson[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="font-display text-2xl font-bold">Darslar</h1>

        <div className="mt-5 flex flex-col gap-3">
          {loading && (
            <p className="py-10 text-center text-textSecondary">
              Yuklanmoqda...
            </p>
          )}

          {!loading && lessons.length === 0 && (
            <p className="py-10 text-center text-textSecondary">
              Hali darslar qo'shilmagan.
            </p>
          )}

          {lessons.map((lesson) => (
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
