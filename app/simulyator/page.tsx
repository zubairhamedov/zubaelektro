"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SimulatorCanvas from "@/components/simulator/SimulatorCanvas";

export default function FreeSimulyatorPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-textSecondary active:bg-white/10"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-base font-semibold">Simulyator</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <SimulatorCanvas taskSlug="free" onSuccess={() => {}} />
      </div>
    </div>
  );
}
