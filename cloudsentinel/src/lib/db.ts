import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL || "";
const MOCK_MODE = process.env.MOCK_MODE === "true";
const MOCK_FILE = path.join(process.cwd(), ".mock_db_flow2.json");

export interface AppRegistration {
  app_id: string;
  spiffe_id: string;
  vault_key_name: string;
  github_owner: string;
  detected_stack?: string;
  default_branch: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
}

export interface AppDataRecord {
  id: string;
  app_id: string;
  data_type: string;
  ciphertext: string;
  vault_key_version: number;
  write_latency_ms?: number;
  created_at: string;
}

function getMockAppData(): Map<string, AppDataRecord> {
  try {
    if (fs.existsSync(MOCK_FILE)) {
      const data = JSON.parse(fs.readFileSync(MOCK_FILE, "utf-8"));
      return new Map(Object.entries(data));
    }
  } catch (e) {
    console.warn("[Database] Failed to read mock file:", e);
  }
  return new Map<string, AppDataRecord>();
}

function saveMockAppData(data: Map<string, AppDataRecord>) {
  try {
    const obj = Object.fromEntries(data);
    fs.writeFileSync(MOCK_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.warn("[Database] Failed to write mock file:", e);
  }
}

const MOCK_REG_FILE = path.join(process.cwd(), ".mock_db_registrations.json");

function getMockRegistrations(): Set<string> {
  try {
    if (fs.existsSync(MOCK_REG_FILE)) {
      const data = JSON.parse(fs.readFileSync(MOCK_REG_FILE, "utf-8"));
      return new Set(data);
    }
  } catch (e) {
    console.warn("[Database] Failed to read mock registrations file:", e);
  }
  // Default seed data
  return new Set<string>(["vercel/next.js", "org/app-a", "org/app-b", "facebook/react"]);
}

function saveMockRegistrations(data: Set<string>) {
  try {
    fs.writeFileSync(MOCK_REG_FILE, JSON.stringify(Array.from(data), null, 2));
  } catch (e) {
    console.warn("[Database] Failed to write mock registrations file:", e);
  }
}

// registrations are now backed by a file

export async function saveRegistration(record: AppRegistration) {
  console.log(`[Database] Saving registration for: ${record.app_id}`);

  if (MOCK_MODE || !DATABASE_URL || DATABASE_URL.includes("hostname")) {
    console.warn("[Database] MOCK_MODE active. Saving to registrations file.");
    const data = getMockRegistrations();
    data.add(record.app_id);
    saveMockRegistrations(data);
    return { success: true, mocked: true };
  }

  try {
    const sql = neon(DATABASE_URL);
    const result = await sql`
      INSERT INTO app_registrations (
        app_id, 
        spiffe_id, 
        vault_key_name, 
        github_owner, 
        detected_stack, 
        default_branch, 
        status
      ) VALUES (
        ${record.app_id}, 
        ${record.spiffe_id}, 
        ${record.vault_key_name}, 
        ${record.github_owner}, 
        ${record.detected_stack || null}, 
        ${record.default_branch}, 
        ${record.status}
      )
      ON CONFLICT (app_id) DO UPDATE SET
        spiffe_id = EXCLUDED.spiffe_id,
        vault_key_name = EXCLUDED.vault_key_name,
        detected_stack = EXCLUDED.detected_stack,
        default_branch = EXCLUDED.default_branch,
        status = EXCLUDED.status
      RETURNING *
    `;
    return result;
  } catch (error: any) {
    if (error.code === "23505") { // Unique violation
      throw new Error("ALREADY_REGISTERED");
    }
    console.error("[Neon DB] Save failed:", error);
    throw new Error("DATABASE_ERROR");
  }
}

export async function checkExistingRegistration(appId: string): Promise<boolean> {
  if (MOCK_MODE || !DATABASE_URL || DATABASE_URL.includes("hostname")) {
    const data = getMockRegistrations();
    return data.has(appId);
  }

  try {
    const sql = neon(DATABASE_URL);
    const result = await sql`
      SELECT app_id FROM app_registrations WHERE app_id = ${appId} LIMIT 1
    `;
    return result.length > 0;
  } catch (error) {
    console.error("[Neon DB] Check failed:", error);
    return false;
  }
}

export async function listRegistrations(): Promise<AppRegistration[]> {
  if (MOCK_MODE || !DATABASE_URL || DATABASE_URL.includes("hostname")) {
    const data = getMockRegistrations();
    return Array.from(data).map(id => ({
      app_id: id as string,
      spiffe_id: `spiffe://cloudsentinel.io/app/${id}`,
      vault_key_name: (id as string).replace("/", "-"),
      github_owner: (id as string).split("/")[0],
      default_branch: "main",
      status: "ACTIVE"
    }));
  }

  try {
    const sql = neon(DATABASE_URL);
    const result = await sql`
      SELECT * FROM app_registrations ORDER BY registered_at DESC
    `;
    return result as AppRegistration[];
  } catch (error) {
    console.error("[Neon DB] List failed:", error);
    return [];
  }
}

export async function saveDataRecord(record: AppDataRecord) {
  console.log(`[Database] Saving data record for app: ${record.app_id}`);

  if (MOCK_MODE || !DATABASE_URL || DATABASE_URL.includes("hostname")) {
    const data = getMockAppData();
    data.set(record.id, record);
    saveMockAppData(data);
    return { success: true, mocked: true };
  }

  try {
    const sql = neon(DATABASE_URL);
    await sql`
      INSERT INTO app_data (
        id, app_id, data_type, ciphertext, vault_key_version, write_latency_ms, created_at
      ) VALUES (
        ${record.id}, ${record.app_id}, ${record.data_type}, ${record.ciphertext}, 
        ${record.vault_key_version}, ${record.write_latency_ms || null}, ${record.created_at}
      )
    `;
    return { success: true };
  } catch (error) {
    console.error("[Neon DB] Data save failed:", error);
    throw new Error("DATABASE_ERROR");
  }
}

export async function getDataRecord(recordId: string): Promise<AppDataRecord | null> {
  if (MOCK_MODE || !DATABASE_URL || DATABASE_URL.includes("hostname")) {
    const data = getMockAppData();
    return data.get(recordId) || null;
  }

  try {
    const sql = neon(DATABASE_URL);
    const result = await sql`
      SELECT * FROM app_data WHERE id = ${recordId} LIMIT 1
    `;
    return (result[0] as AppDataRecord) || null;
  } catch (error) {
    console.error("[Neon DB] Data fetch failed:", error);
    return null;
  }
}

export async function listAppData(appId: string): Promise<AppDataRecord[]> {
  if (MOCK_MODE || !DATABASE_URL || DATABASE_URL.includes("hostname")) {
    const data = Array.from(getMockAppData().values());
    return data.filter(r => r.app_id === appId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  try {
    const sql = neon(DATABASE_URL);
    const result = await sql`
      SELECT * FROM app_data WHERE app_id = ${appId} ORDER BY created_at DESC
    `;
    return result as AppDataRecord[];
  } catch (error) {
    console.error("[Neon DB] List app data failed:", error);
    return [];
  }
}
