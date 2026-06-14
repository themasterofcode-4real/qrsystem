export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { addLog } from '@/lib/db';
import { evaluateAccess, parseQr } from '@/lib/users';
import { formatAccessLog } from '@/lib/log-format';
import { sendAccessEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { qr, location } = await req.json();
    const parsed = parseQr(String(qr || ''));
    await addLog({ eventType: 'scan attempts', body: `Scan attempt: ${String(qr || '')}` });

    if (!parsed.ok) {
      await addLog({
        eventType: parsed.reason.includes('recognized') ? 'unknown user' : 'invalid QR',
        body: parsed.reason,
      });
      return NextResponse.json({ ok: false, error: parsed.reason }, { status: 400 });
    }

    const destination = String(location || '');
    const access = evaluateAccess(destination);
    const now = new Date();
    const body = formatAccessLog({
      timestamp: now,
      result: access.result,
      name: parsed.user.name,
      id: parsed.user.id,
      role: parsed.user.role,
      department: parsed.user.department,
      location: destination,
      reason: access.reason,
    });

    await addLog({
      eventType: access.result === 'GRANTED' ? 'successful access' : 'denied access',
      body,
      timestamp: now,
    });

    sendAccessEmail({
      result: access.result,
      name: parsed.user.name,
      id: parsed.user.id,
      role: parsed.user.role,
      department: parsed.user.department,
      location: destination,
      reason: access.reason,
      timestamp: now.toISOString(),
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      result: access.result,
      reason: access.reason,
      user: parsed.user,
      location: destination,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected processing error' }, { status: 500 });
  }
}
