import type { KPI, Status } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function achievementPct(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return clamp((current / target) * 100, 0, 100);
}

export function overallScore(kpis: KPI[]): number {
  const totalWeight = kpis.reduce((sum, k) => sum + k.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = kpis.reduce(
    (sum, k) => sum + k.weight * achievementPct(k.current, k.target),
    0
  );

  return weightedSum / totalWeight;
}

export function pctOnTrack(kpis: KPI[]): number {
  if (kpis.length === 0) return 0;
  const onTrack = kpis.filter((k) => k.status === "on_track").length;
  return (onTrack / kpis.length) * 100;
}

export function atRiskCount(kpis: KPI[]): number {
  return kpis.filter((k) => k.status === "at_risk" || k.status === "behind").length;
}

export function categoryBreakdown(kpis: KPI[]): Record<string, number> {
  const groups: Record<string, KPI[]> = {};

  for (const kpi of kpis) {
    if (!groups[kpi.category]) groups[kpi.category] = [];
    groups[kpi.category].push(kpi);
  }

  const result: Record<string, number> = {};
  for (const category in groups) {
    const catKpis = groups[category];
    const avg =
      catKpis.reduce((sum, k) => sum + achievementPct(k.current, k.target), 0) /
      catKpis.length;
    result[category] = avg;
  }

  return result;
}

export function statusDistribution(kpis: KPI[]): Record<Status, number> {
  const result: Record<Status, number> = {
    not_started: 0,
    on_track: 0,
    at_risk: 0,
    behind: 0,
  };

  for (const kpi of kpis) {
    result[kpi.status]++;
  }

  return result;
}