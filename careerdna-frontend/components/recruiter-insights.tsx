"use client";

import { motion } from "framer-motion";
import type { RecruiterInsight } from "@/lib/insights";

const toneStyles: Record<RecruiterInsight["tone"], string> = {
  positive: "border-emerald-400/30 bg-emerald-400/5",
  neutral: "border-white/10 bg-white/[0.03]",
  watch: "border-amber-400/35 bg-amber-400/5",
};

export function RecruiterInsights({ items }: { items: RecruiterInsight[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.06, type: "spring", stiffness: 280, damping: 24 }}
          className={`rounded-xl border px-4 py-3 ${toneStyles[item.tone]}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-100">{item.detail}</p>
        </motion.div>
      ))}
    </div>
  );
}
