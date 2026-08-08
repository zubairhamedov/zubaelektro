"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zubaelektro-theme");
    const light = saved === "light";
    setIsLight(light);
    document.documentElement.classList.toggle("light", light);
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("zubaelektro-theme", next ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Mavzuni almashtirish"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-textSecondary transition-colors active:bg-white/10"
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
