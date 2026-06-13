# QR Access Kiosk

## Ambiguity Analysis
- Admin sessions are client-local because no persistent auth mechanism was specified; the fixed password gates the admin panel and admin events are logged.
- Camera diagnostics require browser permission, so the server returns `CLIENT_CHECK` and the client resolves PASS/FAIL when diagnostics are opened.
- Email credentials are environment driven; if missing, email is skipped and operation continues.
- Sound effects are generated with the browser Web Audio API to avoid bundled proprietary assets while satisfying free-use scan, success, and failure tones.
- Local system time for kitchen restrictions is evaluated by the API server runtime.

## Architecture
Next.js App Router serves a React kiosk UI. Browser APIs handle camera, speech, and tones. API routes validate QR input, evaluate access, write encrypted SQLite logs, and dispatch Resend emails asynchronously.

## Folder Structure
- `src/app/page.tsx` kiosk UI and state machine.
- `src/app/api/*` API routes.
- `src/lib/*` users, access rules, SQLite, AES-GCM, email, and log formatting.
- `src/components/ui/*` shadcn-style reusable UI primitives.
- `src/hooks/*` browser hooks.
- `data/` SQLite storage.

## Database Schema
```sql
CREATE TABLE logs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  encrypted_body TEXT NOT NULL
);
CREATE INDEX idx_logs_ts ON logs(timestamp);
```

## State Machine Diagram
`HOME -> SCANNING -> LOCATION_SELECTION -> PROCESSING -> RESULT -> RESET -> HOME`

## UI Specification
The home screen is high-contrast and touch-first, with a dominant START SCAN button and secondary ADMIN MENU, DIAGNOSTICS, and ABOUT controls. The scanner is full-screen with a centered scan box and dimmed outside area. Location, processing, granted, denied, offline, and admin screens use large typography and large tap targets.

## API Design
- `POST /api/access` accepts `{ qr, location }`, validates the user and destination, logs, emails, and returns the result.
- `GET /api/logs` returns decrypted admin log views with optional search and event filters.
- `POST /api/admin` validates admin login and logs login/logout.
- `GET /api/diagnostics` returns server diagnostics.
- `POST /api/email/test` sends a diagnostics email when configured.
- `POST /api/event` logs startup, shutdown, camera failure, and related events.

## Security Review
Logs are encrypted at rest with AES-256-GCM using `LOG_ENCRYPTION_KEY` or a development fallback. Email failures are isolated. Admin password is fixed by requirement and should be replaced by real authentication before production exposure. Camera access only starts after user action.

## Acceptance Tests
1. Open the website and verify the camera is inactive.
2. Press START SCAN and hear the scan prompt.
3. Scan `ID:4|NAME:JOSEPHROYALTY`.
4. Confirm destination buttons appear.
5. Click BATHROOM.
6. Confirm access granted speech, encrypted log creation, email attempt, and reset to HOME.
7. Scan malformed and unknown QR values and confirm graceful recovery.
8. Select KITCHEN between 20:00:00 and 05:59:59 server local time and confirm denial.

## Deployment Instructions
1. Set `LOG_ENCRYPTION_KEY` to a strong secret.
2. Optionally set `SQLITE_PATH`.
3. Set `RESEND_API_KEY`, `ALERT_EMAIL_FROM`, and `ALERT_EMAIL_TO` for email.
4. Run `npm install`, `npm run build`, and `npm start`.
5. Serve over HTTPS so camera permissions work reliably.

## Verification Checklist
- Home screen renders.
- Camera starts only after START SCAN.
- QR validation enforces ID and NAME.
- All destinations are button-selected.
- Kitchen time rule is enforced.
- Speech cancels prior utterances.
- Scan, success, and failure tones play.
- Logs are encrypted in SQLite.
- Email failures do not block operation.
- Admin diagnostics, log view, theme toggle, reset, shutdown, and reactivation work.
