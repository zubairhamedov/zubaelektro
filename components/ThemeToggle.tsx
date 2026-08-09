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
      className={`relative flex h-9 w-[52px] items-center rounded-full border transition-colors ${
        isLight ? "border-black/10 bg-black/5" : "border-white/10 bg-white/5"
      }`}
    >
      <span
        className={`absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-bg shadow-card transition-all ${
          isLight ? "left-[18px]" : "left-1"
        }`}
      >
        {isLight ? <Sun size={15} /> : <Moon size={15} />}
      </span>
    </button>
  );
}
