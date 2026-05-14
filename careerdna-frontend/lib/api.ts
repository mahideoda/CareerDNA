import type {
  ApiErrorBody,
  DashboardResponse,
  ResumeUploadResponse,
} from "@/lib/types";

const DEFAULT_BASE = "http://127.0.0.1:8000";

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BASE;
}

function parseErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const b = body as ApiErrorBody;
    if (typeof b.detail === "string") return b.detail;
    if (Array.isArray(b.detail) && b.detail[0]?.msg) {
      return b.detail.map((d) => d.msg).filter(Boolean).join("; ");
    }
  }
  return `Request failed (${status})`;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/dashboard`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseErrorMessage(res.status, data));
  }
  return data as DashboardResponse;
}

export type UploadProgressCallback = (percent: number) => void;

/**
 * Upload resume PDF using `fetch` + `FormData` (multipart field `file`).
 * Byte-accurate upload progress is not available with fetch+FormData in browsers;
 * `onProgress` is driven by a smooth estimator that completes at 100% when the response returns.
 */
export async function uploadResumePdf(
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<ResumeUploadResponse> {
  const form = new FormData();
  form.append("file", file);

  let raf = 0;
  let cancelled = false;
  const start = performance.now();
  const durationMs = Math.min(9000, 1200 + Math.min(file.size / 50_000, 7000));

  const tick = () => {
    if (!onProgress || cancelled) return;
    const t = (performance.now() - start) / durationMs;
    const eased = 1 - Math.pow(1 - Math.min(1, t), 2);
    onProgress(Math.min(92, Math.round(eased * 92)));
    raf = requestAnimationFrame(tick);
  };
  if (onProgress) {
    onProgress(4);
    raf = requestAnimationFrame(tick);
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/resume/upload`, {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(res.status, data));
    }
    onProgress?.(100);
    return data as ResumeUploadResponse;
  } finally {
    cancelled = true;
    cancelAnimationFrame(raf);
  }
}
