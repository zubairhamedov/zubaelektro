"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, HelpCircle, User } from "lucide-react";

const tabs = [
  { href: "/home", label: "Bosh sahifa", icon: Home },
  { href: "/darslar", label: "Darslar", icon: BookOpen },
  { href: "/testlar", label: "Testlar", icon: HelpCircle },
  { href: "/profil", label: "Profil", icon: User },
];

export default function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="tab-blur fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl2 px-4 py-1.5 transition-colors ${
                active ? "text-accent" : "text-textSecondary"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
