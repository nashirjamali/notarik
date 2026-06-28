import { Pool } from "pg";

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return url;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getConnectionString() });
  }
  return pool;
}

async function initSchema(client: Pool): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      merchant TEXT NOT NULL,
      date DATE NOT NULL,
      total INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'IDR',
      category TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      image_thumb TEXT
    );

    CREATE TABLE IF NOT EXISTS budget (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      monthly_total INTEGER
    );

    INSERT INTO budget (id, monthly_total)
    VALUES (1, NULL)
    ON CONFLICT (id) DO NOTHING;
  `);
}

export async function ensureDb(): Promise<Pool> {
  const client = getPool();
  if (!initPromise) {
    initPromise = initSchema(client).catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
  return client;
}
