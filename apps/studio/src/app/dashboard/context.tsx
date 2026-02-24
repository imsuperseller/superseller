"use client";

import { createContext, useContext } from "react";
import type { WinnerUser } from "@/types";

export interface DashboardCredits {
  available: number;
  total: number;
  used: number;
  monthlyRemaining: number;
}

export interface UserContextValue {
  user: WinnerUser;
  credits: DashboardCredits | null;
  refreshCredits: () => Promise<void>;
}

export const DashboardContext = createContext<UserContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardLayout");
  return ctx;
}
