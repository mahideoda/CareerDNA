"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

type Row = { subject: string; value: number; fullMark: number };

export function SkillsRadar({ data }: { data: Row[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="glass relative h-[320px] w-full overflow-hidden p-4 md:h-[360px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-fuchsia-500/10" />
      <p className="relative z-10 text-xs uppercase tracking-[0.25em] text-slate-400">Signal radar</p>
      <p className="relative z-10 mt-1 text-lg font-semibold text-white">Profile shape</p>
      <div className="relative z-10 mt-2 h-[260px] w-full md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="52%" outerRadius="72%" data={data}>
            <PolarGrid stroke="rgba(148,163,184,0.25)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#cbd5f5", fontSize: 11 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
