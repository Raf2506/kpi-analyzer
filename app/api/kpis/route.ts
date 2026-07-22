import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.data.kpis);
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = await getDb();

  const newKpi = { id: randomUUID(), ...body };
  db.data.kpis.push(newKpi);
  await db.write();

  return NextResponse.json(newKpi, { status: 201 });
}