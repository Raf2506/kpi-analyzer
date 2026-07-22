"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  overallScore,
  pctOnTrack,
  atRiskCount,
  categoryBreakdown,
  statusDistribution,
  achievementPct,
} from "../../lib/metrics";
import type { KPI, Status } from "../../lib/types";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}

const STATUS_LABELS: Record<Status, string> = {
  not_started: "Not Started",
  on_track: "On Track",
  at_risk: "At Risk",
  behind: "Behind",
};

const STATUS_PIE_COLORS: Record<Status, string> = {
  not_started: "#9CA3AF",
  on_track: "#22C55E",
  at_risk: "#EAB308",
  behind: "#EF4444",
};

type SortKey = "employee" | "title" | "weight" | "progress" | "status";

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("employee");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [empRes, kpiRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/kpis"),
      ]);
      setEmployees(await empRes.json());
      setKpis(await kpiRes.json());
      setLoading(false);
    }
    load();
  }, []);

  const employeeName = (id: string) =>
    employees.find((e) => e.id === id)?.name ?? "Unknown";

  const score = useMemo(() => overallScore(kpis), [kpis]);
  const onTrackPct = useMemo(() => pctOnTrack(kpis), [kpis]);
  const riskCount = useMemo(() => atRiskCount(kpis), [kpis]);
  const catBreakdown = useMemo(() => categoryBreakdown(kpis), [kpis]);
  const statusDist = useMemo(() => statusDistribution(kpis), [kpis]);

  const gaugeData = [{ name: "Score", value: score, fill: "#111827" }];
  const donutData = (Object.keys(statusDist) as Status[]).map((s) => ({
    name: STATUS_LABELS[s],
    value: statusDist[s],
    color: STATUS_PIE_COLORS[s],
  }));
  const barData = Object.entries(catBreakdown).map(([category, avg]) => ({
    category,
    achievement: Number(avg.toFixed(1)),
  }));

  const filteredKpis = useMemo(() => {
    let rows = kpis.map((k) => ({
      ...k,
      employee: employeeName(k.employeeId),
      progress: achievementPct(k.current, k.target),
    }));

    if (employeeFilter !== "all") {
      rows = rows.filter((k) => k.employeeId === employeeFilter);
    }
    if (statusFilter !== "all") {
      rows = rows.filter((k) => k.status === statusFilter);
    }

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "employee") cmp = a.employee.localeCompare(b.employee);
      else if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "weight") cmp = a.weight - b.weight;
      else if (sortKey === "progress") cmp = a.progress - b.progress;
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });

    return rows;
  }, [kpis, employees, employeeFilter, statusFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  if (loading) {
    return <main className="p-8">Loading dashboard…</main>;
  }

  if (kpis.length === 0) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>No KPI data yet. Run `npm run seed` to populate demo data.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Top stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Overall Score</p>
          <p className="text-3xl font-bold">{score.toFixed(1)}%</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">% On Track</p>
          <p className="text-3xl font-bold">{onTrackPct.toFixed(1)}%</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">At-Risk KPIs</p>
          <p className="text-3xl font-bold">{riskCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="border rounded-lg p-4">
          <p className="font-semibold mb-2 text-sm">Overall Score</p>
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={90}
                endAngle={-270}
                barSize={20}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  angleAxisId={0}
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">{score.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <p className="font-semibold mb-2 text-sm">Status Distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded-lg p-4">
          <p className="font-semibold mb-2 text-sm">Category Breakdown</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ bottom: 20 }}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={55}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="achievement" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border rounded px-3 py-2 text-sm"
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
        >
          <option value="all">All Employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("employee")}>
              Employee {sortKey === "employee" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("title")}>
              KPI {sortKey === "title" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("weight")}>
              Weight {sortKey === "weight" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("progress")}>
              Progress {sortKey === "progress" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("status")}>
              Status {sortKey === "status" && (sortAsc ? "▲" : "▼")}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredKpis.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-gray-500">
                No KPIs match the current filters.
              </td>
            </tr>
          ) : (
            filteredKpis.map((k) => (
              <tr key={k.id} className="border-b">
                <td className="py-2 pr-4">{k.employee}</td>
                <td className="py-2 pr-4">{k.title}</td>
                <td className="py-2 pr-4">{k.weight}%</td>
                <td className="py-2 pr-4">{k.progress.toFixed(0)}%</td>
                <td className="py-2 pr-4">{STATUS_LABELS[k.status]}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}
