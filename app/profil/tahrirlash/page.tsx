"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateProfile, changePassword } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function TahrirlashPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileSaving(true);
    const { error } = await updateProfile(fullName, phone);
    setProfileSaving(false);
    if (error) {
      setProfileError("Xatolik yuz berdi, qayta urinib ko'ring");
      return;
    }
    await refreshProfile();
    setProfileMessage("Saqlandi!");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword.length < 6) {
      setPasswordError("Yangi parol kamida 6 ta belgidan iborat bo'lsin");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Yangi parollar mos kelmadi");
      return;
    }

    setPasswordSaving(true);
    const { error } = await changePassword(currentPassword, newPassword);
    setPasswordSaving(false);

    if (error) {
      setPasswordError(error.message || "Xatolik yuz berdi");
      return;
    }
    setPasswordMessage("Parol o'zgartirildi!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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

        <h1 className="font-display text-2xl font-bold">Profilni tahrirlash</h1>

        <form onSubmit={handleSaveProfile} className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-sm text-textSecondary">
              Ism familiya
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl2 border border-white/10 bg-surface px-4 py-3.5 text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-textSecondary">
              Telefon raqam
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl2 border border-white/10 bg-surface px-4 py-3.5 text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {profileError && <p className="text-sm text-danger">{profileError}</p>}
          {profileMessage && <p className="text-sm text-success">{profileMessage}</p>}

          <button
            type="submit"
            disabled={profileSaving}
            className="mt-2 rounded-xl2 bg-accent py-3.5 font-display font-semibold text-bg active:opacity-80 disabled:opacity-50"
          >
            {profileSaving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>

        <h2 className="mt-10 font-display text-lg font-semibold">
          Parolni o'zgartirish
        </h2>
        <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-sm text-textSecondary">
              Eski parol
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl2 border border-white/10 bg-surface px-4 py-3.5 text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-textSecondary">
              Yangi parol
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl2 border border-white/10 bg-surface px-4 py-3.5 text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-textSecondary">
              Yangi parolni takrorlang
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl2 border border-white/10 bg-surface px-4 py-3.5 text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-success">{passwordMessage}</p>}

          <button
            type="submit"
            disabled={passwordSaving}
            className="mt-2 rounded-xl2 border border-accent/40 bg-accent/10 py-3.5 font-display font-semibold text-accent active:opacity-80 disabled:opacity-50"
          >
            {passwordSaving ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
