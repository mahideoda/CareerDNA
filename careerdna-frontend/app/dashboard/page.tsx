"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCareerDNA } from "@/context/careerdna-context";
import { fetchDashboard } from "@/lib/api";
import { buildRecruiterInsights } from "@/lib/insights";
import { mapScoresToUi, radarSeriesFromUpload } from "@/lib/score-mapper";
import { GlassCard } from "@/components/glass-card";
import { ScoreCard } from "@/components/score-card";
import { SkillsRadar } from "@/components/skills-radar";
import { RecruiterInsights } from "@/components/recruiter-insights";

export default function DashboardPage() {
  const { uploadResult, dashboard, setDashboard, clearSession } = useCareerDNA();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const dash = await fetchDashboard();
        if (!cancelled) setDashboard(dash);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [setDashboard]);

  if (!uploadResult && !dashboard) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <GlassCard>
          <h1 className="text-2xl font-semibold text-white">No signals yet</h1>
          <p className="mt-3 text-sm text-slate-300">Upload a resume to hydrate this dashboard from the API.</p>
          <Link
            href="/upload"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Go to upload
          </Link>
        </GlassCard>
      </main>
    );
  }

  const ui = uploadResult ? mapScoresToUi(uploadResult.score) : null;
  const radarData = uploadResult ? radarSeriesFromUpload(uploadResult) : [];
  const insights = uploadResult ? buildRecruiterInsights(uploadResult) : [];

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-12">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <header className="relative z-10 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Live cockpit</p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Mission dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            All tiles below are bound to API payloads — upload scores for precision, dashboard for cohort context.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/upload"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100 backdrop-blur hover:border-cyan-400/40"
          >
            New upload
          </Link>
          <button
            type="button"
            onClick={clearSession}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Clear session
          </button>
        </div>
      </header>

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-50"
          >
            {error} <span className="text-amber-100/80">— showing cached session data if available.</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 mb-6 flex items-center gap-3 text-xs text-slate-400">
        <span
          className={`h-2 w-2 rounded-full ${loading ? "animate-pulse bg-cyan-400" : "bg-emerald-400"}`}
          aria-hidden
        />
        <span>{loading ? "Syncing dashboard…" : "Dashboard sync idle"}</span>
        {uploadResult ? (
          <span className="ml-auto font-mono text-[11px] text-slate-500">
            last file: {uploadResult.filename}
          </span>
        ) : null}
      </div>

      {uploadResult && ui ? (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          <ScoreCard
            label="Readiness score"
            value={ui.readiness}
            hint="Mapped from structure signals in API payload."
            accent="emerald"
          />
          <ScoreCard
            label="ATS score"
            value={ui.ats}
            hint="Mapped from keyword relevance in API payload."
            accent="cyan"
          />
          <ScoreCard
            label="Impact blend"
            value={ui.impact}
            hint="Hybrid of depth + overall from API breakdown."
            accent="violet"
          />
          <ScoreCard
            label="Overall"
            value={ui.overall}
            hint="Directly from `score.overall`."
            accent="fuchsia"
          />
        </motion.section>
      ) : (
        <GlassCard className="mb-6 text-sm text-slate-300">
          Upload context missing — scores require the latest `POST /api/resume/upload` response in session state.
        </GlassCard>
      )}

      <div className="relative z-10 mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {radarData.length ? <SkillsRadar data={radarData} /> : (
            <GlassCard className="h-[320px] items-center justify-center text-sm text-slate-400">
              Radar needs upload response dimensions.
            </GlassCard>
          )}
        </div>
        <GlassCard className="lg:col-span-2" glow>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Recruiter insights</p>
          <p className="mt-2 text-lg font-semibold text-white">Narrative layer</p>
          <p className="mt-2 text-xs text-slate-400">
            Generated client-side from API scores + `text_preview` (no mock lorem).
          </p>
          <div className="mt-4">
            {insights.length ? (
              <RecruiterInsights items={insights} />
            ) : (
              <p className="text-sm text-slate-500">Insights unlock after an upload.</p>
            )}
          </div>
        </GlassCard>
      </div>

      {dashboard ? (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="relative z-10 mt-8 grid gap-5 lg:grid-cols-3"
        >
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total uploads</p>
            <p className="mt-3 text-4xl font-semibold text-white">{dashboard.total_uploads}</p>
            <p className="mt-2 text-xs text-slate-500">From `GET /api/dashboard`</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Average overall</p>
            <p className="mt-3 text-4xl font-semibold text-white">
              {dashboard.average_overall_score != null ? dashboard.average_overall_score : "—"}
            </p>
            <p className="mt-2 text-xs text-slate-500">Cohort mean across parsed resumes in memory</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Score distribution</p>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              {Object.entries(dashboard.score_distribution).map(([band, count]) => (
                <div key={band} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-slate-400">{band}</span>
                  <span className="font-mono text-cyan-200">{count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent uploads</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Filename</th>
                    <th className="px-4 py-3">Overall</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent.map((row) => (
                    <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-mono text-xs text-slate-200">{row.filename}</td>
                      <td className="px-4 py-3 text-cyan-200">{row.overall_score}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.section>
      ) : null}

      {uploadResult ? (
        <GlassCard className="relative z-10 mt-8 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Latest API payload</p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-black/40 p-4 font-mono text-[11px] text-cyan-100/90">
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        </GlassCard>
      ) : null}
    </main>
  );
}
