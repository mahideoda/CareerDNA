import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-60" />
      <div className="glass-strong relative max-w-xl p-10 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">CareerDNA</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Calibrate your resume against real scoring signals
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Upload a PDF, let the FastAPI engine parse and score it, then explore a live dashboard wired to{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-cyan-200">
            POST /api/resume/upload
          </code>{" "}
          and{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-cyan-200">
            GET /api/dashboard
          </code>
          .
        </p>
        <Link
          href="/upload"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:brightness-110"
        >
          Start upload
        </Link>
      </div>
    </main>
  );
}
