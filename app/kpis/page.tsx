"use client";

import { useEffect, useState } from "react";

interface Employee {
  id: string;
  name: string;
}

interface KPI {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  target: number;
  current: number;
  unit: string;
  status: "not_started" | "on_track" | "at_risk" | "behind";
}

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-200 text-gray-700",
  on_track: "bg-green-100 text-green-700",
  at_risk: "bg-yellow-100 text-yellow-800",
  behind: "bg-red-100 text-red-700",
};

export default function KpisPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [kpisRes, empRes] = await Promise.all([
      fetch("/api/kpis"),
      fetch("/api/employees"),
    ]);
    setKpis(await kpisRes.json());
    setEmployees(await empRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function employeeName(id: string) {
    return employees.find((e) => e.id === id)?.name ?? "Unknown";
  }

  async function updateStatus(id: string, status: KPI["status"]) {
    await fetch(`/api/kpis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  async function deleteKpi(id: string) {
    if (!confirm("Delete this KPI?")) return;
    await fetch(`/api/kpis/${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <main className="p-8">Loading KPIs…</main>;

  if (kpis.length === 0) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">KPIs</h1>
        <p>No KPIs yet. Run `npm run seed` or add one via the API.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">KPIs</h1>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Employee</th>
            <th className="py-2 pr-4">KPI</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Weight</th>
            <th className="py-2 pr-4">Progress</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi) => {
            const pct = Math.min(100, Math.max(0, (kpi.current / kpi.target) * 100));
            return (
              <tr key={kpi.id} className="border-b">
                <td className="py-2 pr-4">{employeeName(kpi.employeeId)}</td>
                <td className="py-2 pr-4">{kpi.title}</td>
                <td className="py-2 pr-4">{kpi.category}</td>
                <td className="py-2 pr-4">{kpi.weight}%</td>
                <td className="py-2 pr-4 w-40">
                  <div className="bg-gray-100 rounded h-2 w-full">
                    <div
                      className="bg-black h-2 rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {kpi.current}/{kpi.target} {kpi.unit} ({pct.toFixed(0)}%)
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <select
                    value={kpi.status}
                    onChange={(e) => updateStatus(kpi.id, e.target.value as KPI["status"])}
                    className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[kpi.status]}`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="on_track">On Track</option>
                    <option value="at_risk">At Risk</option>
                    <option value="behind">Behind</option>
                  </select>
                </td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => deleteKpi(kpi.id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}