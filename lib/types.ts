export type Status = "not_started" | "on_track" | "at_risk" | "behind";

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}

export interface ReviewCycle {
  id: string;
  name: string; // e.g. "Q3 2026 (Jul–Sep)"
  startDate: string; // ISO date
  endDate: string;
}

export interface KPI {
  id: string;
  employeeId: string;
  cycleId: string;
  title: string;
  description: string;
  category: "Sales" | "Operations" | "Compliance" | "Development";
  weight: number; // % importance, per-employee weights sum to ~100
  target: number;
  current: number;
  unit: "RM" | "%" | "count";
  status: Status;
}

export interface DbSchema {
  employees: Employee[];
  reviewCycles: ReviewCycle[];
  kpis: KPI[];
}