"use client";

import { motion } from "framer-motion";

export function ScoreCard({
  label,
  value,
  hint,
  accent = "cyan",
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: "cyan" | "fuchsia" | "violet" | "emerald";
}) {
  const ring =
    accent === "cyan"
      ? "from-cyan-400/80 to-sky-500/40"
      : accent === "fuchsia"
        ? "from-fuchsia-400/80 to-pink-500/40"
        : accent === "violet"
          ? "from-violet-400/80 to-purple-500/40"
          : "from-emerald-400/80 to-teal-500/40";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="glass relative overflow-hidden p-5"
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${ring} blur-3xl opacity-60`} />
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{Math.round(value)}</p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-slate-400">{hint}</p> : null}
    </motion.div>
  );
}
