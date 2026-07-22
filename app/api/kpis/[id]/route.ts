import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const updates = await req.json();
  const db = await getDb();

  const kpi = db.data.kpis.find((k) => k.id === params.id);
  if (!kpi) return NextResponse.json({ error: "Not found" }, { status: 404 });

  Object.assign(kpi, updates);
  await db.write();

  return NextResponse.json(kpi);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  db.data.kpis = db.data.kpis.filter((k) => k.id !== params.id);
  await db.write();
  return NextResponse.json({ success: true });
}