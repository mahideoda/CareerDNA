"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCareerDNA } from "@/context/careerdna-context";
import { fetchDashboard } from "@/lib/api";
import { GlassCard } from "@/components/glass-card";
import { AiLoadingOrb } from "@/components/ai-loading-orb";

const MIN_MS = 2200;

export default function AnalyzingPage() {
  const router = useRouter();
  const { uploadResult, setDashboard } = useCareerDNA();
  const [status, setStatus] = useState<"running" | "error">("running");
  const [message, setMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!uploadResult) {
      router.replace("/upload");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setStatus("running");
      setMessage(null);
      try {
        const [dash] = await Promise.all([
          fetchDashboard(),
          new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), MIN_MS)),
        ]);
        if (cancelled) return;
        setDashboard(dash);
        router.replace("/dashboard");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Could not refresh dashboard");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [attempt, router, setDashboard, uploadResult]);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-60" />
      <GlassCard className="relative z-10 w-full text-center" glow>
        <AiLoadingOrb />
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-2xl font-semibold text-white"
        >
          Synthesizing intelligence
        </motion.h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Pulling live aggregates from <span className="font-mono text-cyan-200">GET /api/dashboard</span> while the
          interface finishes its transition choreography.
        </p>

        {uploadResult ? (
          <p className="mt-4 text-xs text-slate-500">
            Anchored to upload <span className="font-mono text-slate-300">{uploadResult.id.slice(0, 10)}…</span>
          </p>
        ) : null}

        {status === "error" && message ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-left text-sm text-amber-50"
          >
            <p className="font-medium text-amber-100">Dashboard fetch failed</p>
            <p className="mt-1 text-amber-50/90">{message}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
                onClick={() => router.replace("/dashboard")}
              >
                Continue with last scores
              </button>
              <button
                type="button"
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-cyan-400/40"
                onClick={() => setAttempt((a) => a + 1)}
              >
                Retry
              </button>
              <Link
                href="/upload"
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white"
              >
                New upload
              </Link>
            </div>
          </motion.div>
        ) : null}
      </GlassCard>
    </main>
  );
}
