"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SimulatorCanvas from "@/components/simulator/SimulatorCanvas";

export default function FreeSimulyatorPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col">
      <div className="relative flex items-center border-b border-white/10 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-textSecondary active:bg-white/10"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-display text-base font-semibold">
          Simulyator
        </h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <SimulatorCanvas taskSlug="free" onSuccess={() => {}} />
      </div>
    </div>
  );
}
