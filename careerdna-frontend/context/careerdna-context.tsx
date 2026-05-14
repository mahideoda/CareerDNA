"use client";

import type { DashboardResponse, ResumeUploadResponse } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_UPLOAD = "careerdna:lastUpload";
const STORAGE_DASHBOARD = "careerdna:dashboard";

type CareerDNAContextValue = {
  uploadResult: ResumeUploadResponse | null;
  dashboard: DashboardResponse | null;
  setUploadResult: (v: ResumeUploadResponse | null) => void;
  setDashboard: (v: DashboardResponse | null) => void;
  clearSession: () => void;
};

const CareerDNAContext = createContext<CareerDNAContextValue | null>(null);

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown | null) {
  if (typeof window === "undefined") return;
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function CareerDNAProvider({ children }: { children: ReactNode }) {
  const [uploadResult, setUploadResultState] = useState<ResumeUploadResponse | null>(null);
  const [dashboard, setDashboardState] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    setUploadResultState(readJson<ResumeUploadResponse>(STORAGE_UPLOAD));
    setDashboardState(readJson<DashboardResponse>(STORAGE_DASHBOARD));
  }, []);

  const setUploadResult = useCallback((v: ResumeUploadResponse | null) => {
    setUploadResultState(v);
    writeJson(STORAGE_UPLOAD, v);
  }, []);

  const setDashboard = useCallback((v: DashboardResponse | null) => {
    setDashboardState(v);
    writeJson(STORAGE_DASHBOARD, v);
  }, []);

  const clearSession = useCallback(() => {
    setUploadResultState(null);
    setDashboardState(null);
    writeJson(STORAGE_UPLOAD, null);
    writeJson(STORAGE_DASHBOARD, null);
  }, []);

  const value = useMemo(
    () => ({
      uploadResult,
      dashboard,
      setUploadResult,
      setDashboard,
      clearSession,
    }),
    [uploadResult, dashboard, setUploadResult, setDashboard, clearSession],
  );

  return <CareerDNAContext.Provider value={value}>{children}</CareerDNAContext.Provider>;
}

export function useCareerDNA() {
  const ctx = useContext(CareerDNAContext);
  if (!ctx) throw new Error("useCareerDNA must be used within CareerDNAProvider");
  return ctx;
}
