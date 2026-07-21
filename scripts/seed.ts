import { randomUUID } from "crypto";
import { getDb } from "../lib/db";
import type { Employee, KPI, ReviewCycle, Status } from "../lib/types";

async function seed() {
  const db = await getDb();

  const cycle: ReviewCycle = {
    id: randomUUID(),
    name: "Q3 2026 (Jul–Sep)",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
  };

  const employees: Employee[] = [
    { id: randomUUID(), name: "Aisyah Rahman", role: "Sales Executive", department: "Sales" },
    { id: randomUUID(), name: "Daniel Tan", role: "Operations Lead", department: "Operations" },
    { id: randomUUID(), name: "Farah Zulkifli", role: "Compliance Officer", department: "Compliance" },
    { id: randomUUID(), name: "Wei Ming Lee", role: "Software Engineer", department: "Development" },
    { id: randomUUID(), name: "Nurul Iman", role: "Sales Manager", department: "Sales" },
  ];

  const statuses: Status[] = ["not_started", "on_track", "at_risk", "behind"];
  const categories: KPI["category"][] = ["Sales", "Operations", "Compliance", "Development"];

  const kpis: KPI[] = [];

  employees.forEach((emp) => {
    for (let i = 0; i < 4; i++) {
      const target = 100 + i * 20;
      const current = Math.round(target * (0.4 + Math.random() * 0.8));
      kpis.push({
        id: randomUUID(),
        employeeId: emp.id,
        cycleId: cycle.id,
        title: `${categories[i % categories.length]} Goal ${i + 1}`,
        description: `Sample KPI ${i + 1} for ${emp.name}`,
        category: categories[i % categories.length],
        weight: 25,
        target,
        current,
        unit: i % 2 === 0 ? "RM" : "count",
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
  });

  db.data.employees = employees;
  db.data.reviewCycles = [cycle];
  db.data.kpis = kpis;
  await db.write();

  console.log(`Seeded ${employees.length} employees, ${kpis.length} KPIs, 1 review cycle.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("SEED FAILED:", err);
    process.exit(1);
  });