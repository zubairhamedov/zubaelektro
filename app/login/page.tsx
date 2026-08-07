"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { loginWithPhone } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await loginWithPhone(phone, password);
    setLoading(false);
    if (error) {
      setError("Telefon raqam yoki parol noto'g'ri");
      return;
    }
    router.push("/home");
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
            <Zap size={32} className="text-accent" strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-2xl font-bold">ZubaElektro</h1>
          <p className="text-sm text-textSecondary">
            Elektrik bo'lishni o'rgan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-sm text-textSecondary">
              Telefon raqam
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full rounded-xl2 border border-white/10 bg-surface px-4 py-3.5 text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-textSecondary">
              Parol
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl2 border border-white/10 bg-surface px-4 py-3.5 text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-xl2 bg-accent py-3.5 font-display font-semibold text-bg transition-opacity active:opacity-80 disabled:opacity-50"
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textSecondary">
          Hisobingiz yo'qmi?{" "}
          <Link href="/register" className="font-medium text-accent">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  );
}
