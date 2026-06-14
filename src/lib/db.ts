import postgres from 'postgres';
import { decryptText, encryptText } from './crypto';

export type LogInput = { eventType: string; body: string; timestamp?: Date };
export type LogRow = { id: number; timestamp: string; eventType: string; body: string };

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  '';

const sql = connectionString
  ? postgres(connectionString, { ssl: 'require', max: 1, idle_timeout: 20, connect_timeout: 10 })
  : null;

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  if (!sql) throw new Error('PostgreSQL connection string is not configured.');
  schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS logs (
      id BIGSERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL,
      event_type TEXT NOT NULL,
      encrypted_body TEXT NOT NULL
    )
  `.then(async () => {
    await sql`CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(timestamp)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type)`;
  });
  return schemaReady;
}

export async function addLog({ eventType, body, timestamp = new Date() }: LogInput) {
  try {
    await ensureSchema();
    await sql!`
      INSERT INTO logs (timestamp, event_type, encrypted_body)
      VALUES (${timestamp.toISOString()}, ${eventType}, ${encryptText(body)})
    `;
    return { ok: true, timestamp: timestamp.toISOString() };
  } catch (error) {
    console.error('Log write failed; kiosk operation will continue.', error);
    return { ok: false, timestamp: timestamp.toISOString() };
  }
}

export async function listLogs(q?: { search?: string; eventType?: string }): Promise<LogRow[]> {
  try {
    await ensureSchema();
    const rows = await sql!`
      SELECT id, timestamp, event_type, encrypted_body
      FROM logs
      ORDER BY id DESC
      LIMIT 500
    `;
    return rows
      .map((r) => ({
        id: Number(r.id),
        timestamp: new Date(r.timestamp).toISOString(),
        eventType: String(r.event_type),
        body: decryptText(String(r.encrypted_body)),
      }))
      .filter(
        (r) =>
          (!q?.eventType || r.eventType === q.eventType) &&
          (!q?.search || `${r.eventType} ${r.body}`.toLowerCase().includes(q.search.toLowerCase())),
      );
  } catch (error) {
    console.error('Log read failed.', error);
    return [];
  }
}

export async function dbOk() {
  await ensureSchema();
  await sql!`SELECT 1`;
  return true;
}
