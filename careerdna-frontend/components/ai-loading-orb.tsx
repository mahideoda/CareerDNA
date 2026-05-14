"use client";

import { motion } from "framer-motion";

export function AiLoadingOrb() {
  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <motion.div
        className="absolute h-36 w-36 rounded-full bg-gradient-to-tr from-cyan-400/40 via-fuchsia-500/30 to-transparent blur-xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
      />
      <motion.div
        className="absolute h-28 w-28 rounded-full border border-cyan-300/40"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-20 w-20 rounded-full border border-fuchsia-400/50"
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.35, 0.9, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.span
        className="relative text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        AI
      </motion.span>
    </div>
  );
}
