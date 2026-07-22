"use client";

import { useEffect, useState } from "react";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", role: "", department: "" });

  async function loadEmployees() {
    setLoading(true);
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.role || !form.department) return;

    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ name: "", role: "", department: "" });
    loadEmployees();
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Employees</h1>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-8 border p-4 rounded-lg">
        <h2 className="font-semibold">Add Employee</h2>
        <input
          className="border rounded px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <button type="submit" className="bg-black text-white rounded px-4 py-2 w-fit">
          Add Employee
        </button>
      </form>

      {loading ? (
        <p>Loading employees…</p>
      ) : employees.length === 0 ? (
        <p>No employees yet. Add one above, or run `npm run seed`.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Role</th>
              <th className="py-2">Department</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b">
                <td className="py-2">{emp.name}</td>
                <td className="py-2">{emp.role}</td>
                <td className="py-2">{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}