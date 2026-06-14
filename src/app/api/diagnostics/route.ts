export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { dbOk } from '@/lib/db';
import { encryptText, decryptText } from '@/lib/crypto';

export async function GET() {
  const checks: Record<string, string> = {
    Camera: 'CLIENT_CHECK',
    Speech: 'CLIENT_CHECK',
    Database: 'FAIL',
    Encryption: 'FAIL',
    Email: process.env.RESEND_API_KEY ? 'PASS' : 'FAIL',
    Storage: process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL ? 'PASS' : 'FAIL',
  };

  try {
    checks.Database = (await dbOk()) ? 'PASS' : 'FAIL';
  } catch {}
  try {
    checks.Encryption = decryptText(encryptText('ok')) === 'ok' ? 'PASS' : 'FAIL';
  } catch {}

  return NextResponse.json({ ok: true, checks });
}
