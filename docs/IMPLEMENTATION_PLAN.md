# Implementation Plan

## Starter Assessment

- The repo is a Laravel starter based on Laravel 13, PHP 8.4, Inertia v3, React 19, Tailwind v4, Fortify, and Wayfinder.
- The current runtime database is sqlite, but `config/database.php` already contains mysql and mariadb connection definitions.
- Queue support is already present with the database driver, jobs table, and failed jobs table.
- Public storage is already configured through the `public` disk and `storage:link`.
- The starter already includes an auth and settings experience, so Phase 1 can build on existing patterns instead of replacing them.

## Existing Reusable Authentication Features

- Fortify view callbacks are already wired in `App\Providers\FortifyServiceProvider`.
- Existing auth actions already cover registration and password reset:
  - `app/Actions/Fortify/CreateNewUser.php`
  - `app/Actions/Fortify/ResetUserPassword.php`
- The `User` model already supports:
  - password hashing
  - email verification support in the UI flow
  - two-factor authentication
  - passkeys
- Existing auth tests already cover:
  - login
  - registration
  - logout
  - invalid login
  - two-factor challenge
  - password reset
  - email verification notification
  - password confirmation

## Existing Reusable Frontend Components

- Layouts:
  - `resources/js/layouts/app-layout.tsx`
  - `resources/js/layouts/app/app-sidebar-layout.tsx`
  - `resources/js/layouts/app/app-header-layout.tsx`
  - `resources/js/layouts/auth-layout.tsx`
  - `resources/js/layouts/auth/*`
  - `resources/js/layouts/settings/layout.tsx`
- Navigation and shell:
  - `resources/js/components/app-shell.tsx`
  - `resources/js/components/app-sidebar.tsx`
  - `resources/js/components/app-header.tsx`
  - `resources/js/components/nav-main.tsx`
  - `resources/js/components/nav-user.tsx`
- Form and feedback primitives:
  - `resources/js/components/input-error.tsx`
  - `resources/js/components/text-link.tsx`
  - `resources/js/components/password-input.tsx`
  - `resources/js/components/heading.tsx`
  - `resources/js/components/delete-user.tsx`
  - `resources/js/components/two-factor-setup-modal.tsx`
  - `resources/js/components/manage-two-factor.tsx`
  - `resources/js/components/manage-passkeys.tsx`
- Shared UI primitives already exist under `resources/js/components/ui/`.

## Existing Application Conventions

- React pages live under `resources/js/pages`.
- Existing page structure mixes flat top-level pages with feature folders such as `auth/` and `settings/`.
- Pages use static `.layout` props for breadcrumbs or page metadata.
- The starter uses Inertia `<Form>` components for most writes.
- The starter uses generated Wayfinder helpers instead of hardcoded route strings.
- The starter uses utility helpers such as `cn`, `toUrl`, `useCurrentUrl`, and `useInitials`.
- Existing styling follows Tailwind utility classes and the bundled design system.

## Existing Routes And Middleware

### Application routes

The current non-vendor route set is small:

- `GET /`
- `GET /dashboard`
- `GET /settings/profile`
- `PATCH /settings/profile`
- `DELETE /settings/profile`
- `GET /settings/security`
- `PUT /settings/password`
- `GET /.well-known/passkey-endpoints`

### Middleware

- `bootstrap/app.php` registers:
  - `HandleAppearance`
  - `HandleInertiaRequests`
  - `AddLinkHeadersForPreloadedAssets`
- Cookies `appearance` and `sidebar_state` are excluded from encryption.
- `HandleInertiaRequests` currently shares:
  - `name`
  - `auth.user`
  - `sidebarOpen`
- The security settings route uses `RequirePassword`.
- There is no tenant middleware yet.

## Existing Database Tables

The current schema contains only starter tables and infrastructure tables:

- `users`
- `password_reset_tokens`
- `sessions`
- `passkeys`
- `cache`
- `cache_locks`
- `jobs`
- `job_batches`
- `failed_jobs`
- `migrations`

Current observations:

- The default connection resolves to sqlite.
- The user table already contains two-factor columns.
- Passkeys are already persisted in their own table.
- No tenant, device, contact, conversation, message, bot rule, webhook log, or audit log tables exist yet.

## Existing Testing Conventions

- Tests are PHPUnit classes.
- Existing feature tests already cover auth, settings, and dashboard behavior.
- Factory-based user setup is already established.
- Test files live under `tests/Feature` and `tests/Unit`.
- The starter uses `RefreshDatabase` in feature tests.
- Existing tests are the best source of truth for current behavior and should be extended rather than replaced.

## Phase 1 Gap Analysis

### Already present

- Session auth with Fortify.
- Registration and login UI.
- Password reset and email verification scaffolding.
- Profile and security settings pages.
- Shared Inertia auth state.
- A reusable sidebar/header application shell.
- Basic dashboard route and page.
- Wayfinder route helpers.

### Still missing for Phase 1

- `tenants` table.
- `tenant_user` membership table.
- User global role and status handling.
- Tenant current-workspace resolution.
- Tenant creation during registration.
- Tenant-scoped authorization policies.
- Super Admin access rules and UI.
- Tenant-aware navigation and dashboard pages.
- Tenant isolation tests.

### Not a blocker for Phase 1

- Minor naming differences in page folders or route names.
- The current local sqlite default, because mysql support already exists in config.

## Proposed Migration Order

1. Add tenant-related columns to `users` if the design needs them for current tenant and global role tracking.
2. Create `tenants`.
3. Create `tenant_user`.
4. Add indexes and foreign keys for tenant membership and current tenant resolution.
5. Add seed data or factories only if the Phase 1 tests need them.

Later phases should then add:

1. WhatsApp device tables and enums.
2. Contact, conversation, and message tables.
3. Webhook and audit tables.
4. Bot rules and supporting indexes.

## Proposed Models And Relationships

- `User`
  - belongs to many `Tenant` records through `tenant_user`
  - has one current tenant
  - may have one global role
  - may have one account status
- `Tenant`
  - belongs to many `User` records through `tenant_user`
  - has one owner membership
  - owns devices and future tenant-scoped records
- `TenantMember` or a pivot model
  - stores role, membership timestamps, and any membership flags

Phase 1 should avoid over-modeling and keep the membership layer simple enough to extend later.

## Proposed Middleware And Policy Design

- Middleware:
  - `ResolveCurrentTenant`
  - `EnsureUserIsActive`
  - `EnsureTenantIsActive`
  - `EnsureSuperAdmin`
- Policies:
  - `TenantPolicy`
  - `TenantMembershipPolicy` or equivalent

Design principles:

- Resolve tenant context from the authenticated user, not from request input.
- Keep tenant-scoped queries isolated and explicit.
- Use policies for object-level checks and middleware for broad access gates.
- Keep super admin powers explicit rather than implicit.

## Proposed Frontend Page Additions

- Tenant dashboard
- Tenant/device shell navigation updates
- Tenant management pages for super admin
- User management pages for super admin
- Basic tenant settings or workspace switcher UI

Reuse the existing shell, layout, button, form, dialog, and heading components where possible.

## Proposed GOWA Integration Boundary

- Keep all GOWA HTTP calls behind a dedicated service layer such as `app/Services/Gowa`.
- Controllers should only authorize, validate, and delegate.
- The browser must never talk to GOWA directly.
- Laravel should own all device identifiers and any headers sent to GOWA.
- Start with one GOWA instance for the MVP.

## Proposed Webhook And Queue Architecture

- Webhooks:
  - read raw payloads
  - verify HMAC signatures
  - log sanitized payload metadata
  - resolve the device from the registered GOWA device ID
  - dispatch queued jobs for heavy work
- Queue jobs:
  - `ProcessIncomingWhatsappMessage`
  - `SendWhatsappMessage`
  - `SyncWhatsappDeviceStatus`
- Use the database queue first.
- Keep jobs idempotent and safe to retry.
- Prevent duplicate incoming records using a unique device plus external message key.

## Proposed Public Media Storage Design

- Use the `public` disk.
- Store media under:
  - `whatsapp/{tenant_ulid}/{device_ulid}/{year}/{month}/`
- Store only relative paths in the database.
- Generate filenames using ULIDs or UUIDs.
- Validate MIME type, extension, and size before persisting uploads.
- Keep media handling behind a dedicated class or action.

## Phase-By-Phase Implementation Checklist

### Phase 1

- Create tenants and membership schema.
- Add tenant-aware registration.
- Add current tenant resolution.
- Add tenant and super admin authorization.
- Add tenant shell navigation.
- Add tenant-aware tests.

### Phase 2

- Add WhatsApp device schema and enums.
- Add GOWA service layer.
- Add device CRUD and connection screens.
- Add mocked integration tests.

### Phase 3

- Add contacts, conversations, and messages.
- Add webhook ingestion, logging, and queueing.
- Add duplicate protection and status updates.

### Phase 4

- Add inbox UI.
- Add text reply and media upload.
- Add public storage handling.

### Phase 5

- Add bot rule CRUD and matching logic.
- Add loop prevention and device isolation tests.

### Phase 6

- Add super admin management screens.
- Add manual limits and system audit views.

### Phase 7

- Harden rate limits, indexes, queue retry behavior, scheduler behavior, and media validation.
- Run the full test and frontend build checks.

## Security Checklist

- Never trust tenant IDs from the browser or webhook payloads.
- Never expose GOWA credentials to Inertia props.
- Keep webhook signatures and secret headers out of logs.
- Enforce authorization in Laravel, not just in the UI.
- Use tenant-scoped queries for all tenant-owned data.
- Prefer safe failure states over partial corruption.
- Keep destructive actions confirmed in the UI and authorized on the backend.

## Testing Plan

- Start with the smallest relevant PHPUnit tests.
- Add or update tests alongside every implementation change.
- Prioritize:
  - registration tenant creation
  - tenant isolation
  - suspended user and tenant handling
  - device limits
  - webhook signature rejection
  - duplicate message prevention
  - queued outgoing messages
  - super admin authorization
- Use factories instead of manual record setup when possible.
- Run `php artisan test --compact` with a targeted file or filter for each change.

## Risks And Mitigations

- Risk: the starter currently uses sqlite while the target architecture expects MySQL.
  - Mitigation: keep the schema portable and validate MySQL behavior before the first tenant migrations land.
- Risk: tenant context can leak through unscoped queries.
  - Mitigation: require tenant-scoped query helpers and policies from the start.
- Risk: auth changes can unintentionally break the starter.
  - Mitigation: reuse the existing Fortify flow and extend it narrowly.
- Risk: the GOWA integration can become tightly coupled to controllers.
  - Mitigation: isolate all outbound HTTP in a service boundary.

## Development Commands

### Backend

- `php artisan route:list --except-vendor`
- `php artisan test --compact`
- `php artisan test --compact tests/Feature/Auth/RegistrationTest.php`
- `php artisan wayfinder:generate --no-interaction`
- `vendor/bin/pint --dirty --format agent`

### Frontend

- `npm run lint`
- `npm run lint:check`
- `npm run format`
- `npm run format:check`
- `npm run types:check`
- `npm run build`
- `npm run build:ssr`

### Composer scripts already defined

- `composer test`
- `composer lint`
- `composer lint:check`
- `composer types:check`
- `composer ci:check`
