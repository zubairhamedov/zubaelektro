"use client";

import Link from "next/link";
import {
  GraduationCap,
  HelpCircle,
  Share2,
  PlayCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import BottomTab from "@/components/BottomTab";
import { useAuth } from "@/components/AuthProvider";

const categories = [
  { href: "/darslar", label: "Darslar", icon: GraduationCap, color: "bg-orange-500/15 text-orange-400" },
  { href: "/testlar", label: "Testlar", icon: HelpCircle, color: "bg-purple-500/15 text-purple-400" },
  { href: "/darslar?tab=sxemalar", label: "Sxemalar", icon: Share2, color: "bg-blue-500/15 text-blue-400" },
  { href: "/darslar?tab=simulator", label: "Simulyator", icon: PlayCircle, color: "bg-green-500/15 text-green-400" },
];

export default function HomePage() {
  const { profile, totalLessons, completedCount, nextLesson, loading } = useAuth();

  const remaining = Math.max(totalLessons - completedCount, 0);
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <p className="text-sm text-textSecondary">Assalomu alaykum,</p>
        <h1 className="font-display text-2xl font-bold">
          {loading ? "\u00A0" : `${profile?.full_name || "Foydalanuvchi"}!`}
        </h1>

        <div className="mt-6 flex items-center justify-between rounded-xl2 border border-accent/20 bg-surface p-5 shadow-card">
          <div>
            <p className="text-sm text-textSecondary">Elektrik ustasi bo'lishga</p>
            <p className="font-display text-lg font-bold text-accent">
              {loading ? "\u00A0" : `${remaining} ta dars qoldi`}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs text-textSecondary">
              <Zap size={14} className="text-accent" />
              <span>{percent}% bajarildi</span>
            </div>
          </div>
          <ProgressRing
            percent={percent}
            size={84}
            strokeWidth={8}
            label={`${percent}%`}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold">
            Kategoriyalar
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}
                >
                  <Icon size={24} />
                </div>
                <span className="text-center text-[11px] text-textSecondary">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {!loading && nextLesson && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">
              Davom etish
            </h2>
            <Link
              href={`/darslar/${nextLesson.slug}`}
              className="flex items-center justify-between rounded-xl2 bg-surface p-4 shadow-card active:bg-surfaceHover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl2 bg-orange-500/15 text-orange-400">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <p className="font-medium">{nextLesson.title}</p>
                  <div className="mt-1.5 h-1.5 w-32 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-textSecondary">
                    {completedCount}/{totalLessons} dars bajarildi
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-textSecondary" />
            </Link>
          </div>
        )}
      </div>

      <BottomTab />
    </div>
  );
}
