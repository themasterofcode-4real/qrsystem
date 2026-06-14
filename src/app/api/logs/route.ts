export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { listLogs } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const logs = await listLogs({
      search: u.searchParams.get('search') || '',
      eventType: u.searchParams.get('eventType') || '',
    });
    return NextResponse.json({ ok: true, logs });
  } catch {
    return NextResponse.json({ ok: false, logs: [] }, { status: 500 });
  }
}
