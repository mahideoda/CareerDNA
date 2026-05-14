"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCareerDNA } from "@/context/careerdna-context";
import { uploadResumePdf } from "@/lib/api";
import { GlassCard } from "@/components/glass-card";
import { UploadProgressBar } from "@/components/upload-progress-bar";

export default function UploadPage() {
  const router = useRouter();
  const { setUploadResult } = useCareerDNA();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onPick = useCallback((f: File | null) => {
    setError(null);
    setFile(f);
    setProgress(0);
  }, []);

  const onSubmit = async () => {
    if (!file) {
      setError("Choose a PDF resume to continue.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted by the API.");
      return;
    }
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const result = await uploadResumePdf(file, setProgress);
      setUploadResult(result);
      router.push("/analyzing");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-14">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-50" />
      <header className="relative z-10 mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Ingest</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Upload resume</h1>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur transition hover:border-cyan-400/40 hover:text-white"
        >
          Dashboard
        </Link>
      </header>

      <GlassCard className="relative z-10">
        <p className="text-sm leading-relaxed text-slate-300">
          Sends <span className="font-mono text-cyan-200">multipart/form-data</span> to{" "}
          <span className="font-mono text-cyan-200">POST /api/resume/upload</span> on your FastAPI server.
        </p>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 px-6 py-10 text-center transition hover:border-cyan-400/40 hover:bg-black/40">
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <span className="text-sm font-medium text-white">
            {file ? file.name : "Drop PDF here or click to browse"}
          </span>
          <span className="mt-2 text-xs text-slate-400">Max size enforced server-side (see backend settings)</span>
        </label>

        <AnimatePresence>
          {busy ? (
            <motion.div
              key="prog"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-4"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Upload &amp; parse pipeline</span>
                <span className="font-mono text-cyan-200">{progress}%</span>
              </div>
              <UploadProgressBar value={progress} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {error ? (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-50"
            >
              {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          disabled={busy || !file}
          onClick={onSubmit}
          whileTap={{ scale: 0.98 }}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-3 text-sm font-semibold text-slate-950 shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Uploading…" : "Analyze resume"}
        </motion.button>
      </GlassCard>
    </main>
  );
}
