"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SimulatorCanvas from "@/components/simulator/SimulatorCanvas";

export default function FreeSimulyatorPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-textSecondary"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Orqaga</span>
        </button>
        <h1 className="ml-2 font-display text-base font-semibold">
          Simulyator (Erkin rejim)
        </h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <SimulatorCanvas taskSlug="free" onSuccess={() => {}} />
      </div>
    </div>
  );
}
