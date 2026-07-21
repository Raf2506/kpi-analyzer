import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.data.employees);
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = await getDb();

  const newEmployee = {
    id: randomUUID(),
    name: body.name,
    role: body.role,
    department: body.department,
  };

  db.data.employees.push(newEmployee);
  await db.write();

  return NextResponse.json(newEmployee, { status: 201 });
}