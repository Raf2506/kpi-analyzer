import { describe, it, expect } from "vitest";
import {
  clamp,
  achievementPct,
  overallScore,
  pctOnTrack,
  atRiskCount,
  categoryBreakdown,
  statusDistribution,
} from "./metrics";
import type { KPI } from "./types";

function makeKpi(overrides: Partial<KPI>): KPI {
  return {
    id: "1",
    employeeId: "e1",
    cycleId: "c1",
    title: "Test KPI",
    description: "",
    category: "Sales",
    weight: 25,
    target: 100,
    current: 50,
    unit: "count",
    status: "on_track",
    ...overrides,
  };
}

describe("clamp", () => {
  it("keeps values within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

describe("achievementPct", () => {
  it("computes basic percentage", () => {
    expect(achievementPct(50, 100)).toBe(50);
  });

  it("clamps above 100%", () => {
    expect(achievementPct(150, 100)).toBe(100);
  });

  it("returns 0 when target is 0", () => {
    expect(achievementPct(50, 0)).toBe(0);
  });

  it("returns 0 when current is negative and target is valid", () => {
    expect(achievementPct(-10, 100)).toBe(0);
  });
});

describe("overallScore", () => {
  it("returns 0 for an empty KPI list", () => {
    expect(overallScore([])).toBe(0);
  });

  it("computes a weighted average across KPIs", () => {
    const kpis = [
      makeKpi({ weight: 50, current: 100, target: 100 }), // 100%
      makeKpi({ weight: 50, current: 50, target: 100 }), // 50%
    ];
    expect(overallScore(kpis)).toBe(75);
  });

  it("handles weights that do not sum to exactly 100", () => {
    const kpis = [
      makeKpi({ weight: 30, current: 100, target: 100 }),
      makeKpi({ weight: 30, current: 0, target: 100 }),
    ];
    // weighted sum = 30*100 + 30*0 = 3000, total weight = 60 → 50
    expect(overallScore(kpis)).toBe(50);
  });
});

describe("pctOnTrack", () => {
  it("returns 0 for empty list", () => {
    expect(pctOnTrack([])).toBe(0);
  });

  it("computes correct percentage on_track", () => {
    const kpis = [
      makeKpi({ status: "on_track" }),
      makeKpi({ status: "on_track" }),
      makeKpi({ status: "at_risk" }),
      makeKpi({ status: "behind" }),
    ];
    expect(pctOnTrack(kpis)).toBe(50);
  });
});

describe("atRiskCount", () => {
  it("counts at_risk and behind together", () => {
    const kpis = [
      makeKpi({ status: "at_risk" }),
      makeKpi({ status: "behind" }),
      makeKpi({ status: "on_track" }),
      makeKpi({ status: "not_started" }),
    ];
    expect(atRiskCount(kpis)).toBe(2);
  });
});

describe("categoryBreakdown", () => {
  it("averages achievement% per category", () => {
    const kpis = [
      makeKpi({ category: "Sales", current: 100, target: 100 }),
      makeKpi({ category: "Sales", current: 50, target: 100 }),
      makeKpi({ category: "Operations", current: 20, target: 100 }),
    ];
    const result = categoryBreakdown(kpis);
    expect(result["Sales"]).toBe(75);
    expect(result["Operations"]).toBe(20);
  });

  it("returns an empty object for no KPIs", () => {
    expect(categoryBreakdown([])).toEqual({});
  });
});

describe("statusDistribution", () => {
  it("counts KPIs per status, defaulting missing statuses to 0", () => {
    const kpis = [
      makeKpi({ status: "on_track" }),
      makeKpi({ status: "on_track" }),
      makeKpi({ status: "behind" }),
    ];
    const result = statusDistribution(kpis);
    expect(result.on_track).toBe(2);
    expect(result.behind).toBe(1);
    expect(result.at_risk).toBe(0);
    expect(result.not_started).toBe(0);
  });
});