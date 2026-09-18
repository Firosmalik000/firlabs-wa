# Implementation Plan

## Current Status

The WhatsApp management platform is fully implemented across Phases 1–7 and the code is verified:

- **Phase 1 — Tenant foundation**: tenants, membership, registration, current-tenant resolution, statuses, roles, isolation policies, navigation.
- **Phase 2 — Devices**: device management, statuses, GOWA integration, QR/pairing, sync, reconnect, logout, soft delete, limits, mocked GOWA tests.
- **Phase 3 — Messaging**: contacts, conversations, messages, HMAC-secured webhook, webhook logs, incoming/outgoing queue jobs, duplicate prevention.
- **Phase 4 — Inbox & media**: conversation list, thread, text reply, image/document upload, public disk storage, failed-message retry.
- **Phase 5 — Bot rules**: CRUD and keyword matching with per-device isolation and loop prevention.
- **Phase 6 — Super Admin**: users, tenants, devices, webhook logs, audit logs, failed jobs.
- **Phase 7 — Hardening (code)**: real GOWA media send, `SyncWhatsappDeviceStatus` scheduler, failed-job retry/forget UI, audit logging, outbound rate limiting.

Verification currently green:

- PHPUnit: 102 tests passing.
- Pint, TypeScript (`tsc`), ESLint: clean.
- Production frontend build: passes.

## Current Focus — Frontend / UX

The next active work is the **UI** layer. Priority improvements (in no fixed order):

- Realtime-ish inbox and device-status experience (controlled polling today; WebSockets are outside the MVP).
- Operator conversation assignment and richer inbox states.
- Contact search, quick-reply templates, and broadcast/blast flows.
- Global search and polished loading / empty / error / confirmation states.
- CSV contact import.

Follow the existing React + Inertia v3 patterns and Wayfinder route functions; reuse the bundled UI components.

## Standby Plan — Deployment & Production Verification

This plan is **on hold**. Run it when we are ready to bring the app to production:

1. **Apply pending migration**: `php artisan migrate` against the MySQL database (`audit_logs` table is not yet applied locally).
2. **Verify live GOWA media send**: start GOWA (Docker), scan a real WhatsApp QR, and send an image/document to a real number.
3. **Run the scheduler**: add cron `php artisan schedule:run` every minute (or `schedule:work`), plus a `queue:work` worker (supervisor) — required for status sync and outgoing messages.
4. **Configure email**: set a real SMTP provider so verification and password-reset emails send (default is `log`).
5. **Secure the seeder**: replace the demo `admin@admin.com` / `password` credential with a strong, non-default bootstrap.

## Reusable Conventions (keep current)

- Controllers authorize, validate via Form Requests, delegate to services/jobs, and return Inertia/redirect/JSON.
- GOWA HTTP stays isolated in `app/Services/Gowa`.
- Tenant-owned queries are tenant-scoped; authorization enforced in Laravel (policies + middleware).
- Queue jobs are idempotent, retry-safe, and record safe failure info.
- Media uses the `public` disk with relative paths and ULID filenames.
- User-facing copy is English.
- Tests are PHPUnit Feature tests using factories and `RefreshDatabase`.

## Development Commands

- `php artisan test --compact`
- `vendor/bin/pint --dirty --format agent`
- `php artisan wayfinder:generate --with-form`
- `npm run types:check`
- `npm run lint:check`
- `npm run build`
- `composer test` (lint + phpstan + full PHPUnit)
