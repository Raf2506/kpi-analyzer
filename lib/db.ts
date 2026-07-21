import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import type { DbSchema } from "./types";

const file = path.join(process.cwd(), "data", "db.json");
const adapter = new JSONFile<DbSchema>(file);
const defaultData: DbSchema = { employees: [], reviewCycles: [], kpis: [] };

export const db = new Low<DbSchema>(adapter, defaultData);

export async function getDb() {
  await db.read();
  db.data ||= defaultData;
  return db;
}