export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { addLog } from '@/lib/db';

export async function POST(req: Request) {
  const { password, action } = await req.json().catch(() => ({}));
  if (action === 'logout') {
    await addLog({ eventType: 'admin logout', body: 'Administrator logged out' });
    return NextResponse.json({ ok: true });
  }
  if (password === 'Joseph3136') {
    await addLog({ eventType: 'admin login', body: 'Administrator access granted' });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
}
