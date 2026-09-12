# AGENTS.md

## Purpose

Work as a senior engineer on this codebase.

Your job is to implement the requested result accurately, safely, and efficiently while preserving the application's existing architecture, conventions, behavior, and design language.

Prefer execution over explanation.

---

# 1. Core Working Principles

Before changing code:

- Inspect the relevant existing implementation.
- Understand the local pattern before introducing a new one.
- Check sibling files when structure, naming, or conventions are unclear.
- Reuse existing components, utilities, services, hooks, actions, routes, translations, and patterns whenever appropriate.

When implementing:

- Make the smallest complete change that solves the task.
- Do not refactor unrelated code.
- Do not rewrite working code merely because another approach looks cleaner.
- Do not introduce unnecessary abstractions.
- Do not duplicate functionality that already exists.
- Preserve backward compatibility unless the task explicitly requires otherwise.
- Follow the application's existing architecture and directory structure.
- Do not create new base directories without approval.
- Do not add, remove, or upgrade dependencies without approval.
- Do not create documentation files unless explicitly requested.

When requirements are clear, proceed autonomously.

Do not ask questions for routine implementation decisions that can be resolved safely from the existing codebase.

---

# 2. Project Context

This is a Laravel application running on PHP 8.4 with an Inertia + React frontend. It is a multi-user, multi-tenant WhatsApp management system built on the official Laravel starter.

Never assume framework or package versions.

When implementation depends on version-specific behavior, determine the installed version from the project first.

For PHP packages, inspect Composer metadata or use:

`composer show <vendor/package>`

For JavaScript packages, inspect `package.json`.

Do not repeatedly check versions when the relevant version is already established in the current context or clearly represented by existing project code.

---

# 3. Existing Code Is the Primary Reference

Existing working project code is the first implementation reference.

When the codebase already demonstrates the correct pattern:

- follow it;
- do not search documentation unnecessarily;
- do not introduce a competing pattern.

Use external/package documentation when:

- behavior is version-specific;
- the API is unfamiliar;
- existing code does not establish the correct approach;
- a framework/package feature is being introduced or changed;
- there is uncertainty about supported behavior.

---

# 4. Project-Specific Rules

This project does not currently use a `.ai/rules/` hierarchy or a `record-rule` mechanism. When the task involves non-obvious project behavior or a durable project constraint, refer to the "WhatsApp Management Project Guidelines" section at the end of this file first, then to existing code.

If a `.ai/rules/index.md` is introduced in the future, inspect it before modifying code and follow every applicable rule.

Do not create `.ai/rules/` files unless explicitly requested.

---

# 5. Laravel Boost

Laravel Boost provides project-aware tools. Prefer Boost tools when they provide safer or more accurate application context than manual inspection.

Use relevant tools selectively.

Prefer:

- `database-schema` before schema-dependent changes;
- `database-query` for read-only database inspection;
- `browser-logs` when investigating recent frontend/browser errors;
- `get-absolute-url` before sharing application URLs;
- `search-docs` for Laravel ecosystem behavior that is version-sensitive, unfamiliar, or insufficiently demonstrated by existing code.

Do not call Boost tools mechanically when the requested change does not require them.

Do not repeatedly search documentation when sufficient results are already available.

---

# 6. Laravel Conventions

Follow existing Laravel conventions used by this application.

When creating Laravel-managed files, use the appropriate Artisan generator where practical.

Use:

`php artisan make:* --no-interaction`

Prefer:

- Eloquent over raw SQL;
- existing models and relationships over duplicated queries;
- Form Requests when consistent with the project;
- named routes over hardcoded application URLs;
- Eloquent API Resources for APIs when consistent with existing API architecture;
- factories when creating test data.

Before introducing a migration, model, service, action, policy, job, event, listener, middleware, or other architectural element, verify that it is actually required.

Do not create additional layers merely for architectural purity.

---

# 7. Database Safety

Before making schema-dependent changes:

- inspect the existing schema;
- inspect relevant models, casts, relationships, scopes, and migrations;
- understand existing constraints and indexes.

Do not modify production-oriented data structures unnecessarily.

Do not create or modify records during investigation unless the task requires it or the user has approved it.

For read-only investigation, prefer safe read-only database tooling.

---

# 8. PHP Standards

Follow existing PHP style and project conventions.

Additionally:

- use curly braces for all control structures;
- use explicit parameter type declarations;
- use explicit return types;
- use constructor property promotion where appropriate;
- do not create empty public constructors;
- use descriptive method and variable names;
- use TitleCase for Enum cases;
- prefer PHPDoc for useful structural/type information;
- use array-shape PHPDoc where it materially improves static understanding;
- avoid unnecessary comments;
- add inline comments only when logic would otherwise be difficult to understand.

Do not add types or abstractions solely to make code look more sophisticated.

---

# 9. Inertia + React

Follow the existing Inertia and React architecture.

Before creating a new frontend pattern:

- inspect similar pages/components;
- reuse existing layout structures;
- reuse existing hooks;
- reuse existing UI components;
- reuse existing form patterns;
- reuse existing route/navigation conventions;
- reuse existing utilities and design tokens.

Use Wayfinder-generated route functions. Import them from `@/actions/` (controllers) or `@/routes/` (named routes) according to the route type.

Do not hardcode application routes when an existing route abstraction should be used.

For version-specific Inertia behavior, consult the relevant installed-version documentation when necessary.

Do not assume APIs from older Inertia versions.

---

# 10. UI and UX

Preserve the existing visual language.

For UI changes:

- reuse the current component system;
- maintain visual consistency;
- maintain responsive behavior;
- preserve accessibility;
- account for loading, empty, success, disabled, and error states when relevant;
- avoid unnecessary redesign of unrelated areas.

Do not change business logic when the task is UI-only.

Do not change UI behavior when the task is backend-only unless necessary.

---

# 11. Localization / Internationalization

The application currently ships English-only user-facing text. There is no `lang/` infrastructure and no translation key organization in this repository.

When adding or changing user-facing text, write it in English to match existing copy. Do not introduce hardcoded multilingual keys, locale configuration, or new language infrastructure unless explicitly requested.

If localization infrastructure is introduced later, update all supported locales and keep translation keys synchronized.

Do not perform localization inspection for changes that do not affect user-facing text.

---

# 12. Testing

Behavioral changes must be covered by an appropriate test when practical and consistent with the project.

Add or update tests for:

- new behavior;
- changed business behavior;
- bug fixes;
- authorization behavior;
- validation behavior;
- important failure modes.

Do not create tests solely for:

- copy-only changes;
- styling-only changes;
- documentation changes;
- equivalent non-behavioral changes;

unless the existing project has a specific convention requiring them.

Prefer Feature tests over Unit tests unless the behavior is genuinely unit-scoped.

Use existing factories and factory states when available.

When creating PHPUnit tests, follow the project's PHPUnit conventions. This project uses PHPUnit exclusively; do not use Pest.

Run the narrowest relevant test set first.

Examples:

`php artisan test --compact --filter=RelevantTest`

or:

`php artisan test --compact tests/Feature/RelevantTest.php`

Do not run the entire test suite unnecessarily when a narrow test sufficiently validates the change.

Escalate to broader testing when the change has wider impact.

---

# 13. Verification

Every implementation must be verified appropriately.

Use the narrowest useful verification for the task.

Depending on the change, verification may include:

- targeted PHPUnit tests;
- type checking;
- linting;
- frontend build;
- relevant browser/runtime checks;
- database/schema inspection;
- route inspection.

Do not create throwaway verification scripts when existing tests or project tooling already prove the behavior.

If PHP files were modified, run:

`vendor/bin/pint --dirty --format agent`

Fix formatting issues before finalizing.

If frontend behavior fails to appear despite correct source changes, consider whether the application's frontend assets need rebuilding or the dev server needs to be running.

Do not treat a stale frontend build as a source-code failure without checking.

---

# 14. Debugging

When fixing a bug:

1. inspect the relevant implementation;
2. reproduce or establish the failure from available evidence;
3. identify the root cause;
4. make the smallest correct fix;
5. verify the affected behavior;
6. check that the fix does not break adjacent behavior.

Do not guess at the root cause when evidence can be obtained from:

- application logs;
- browser logs;
- tests;
- database state;
- routes;
- configuration;
- existing code.

Avoid speculative refactoring during bug fixes.

---

# 15. Security and Data Integrity

Do not weaken:

- authentication;
- authorization;
- validation;
- CSRF protection;
- data isolation;
- tenant boundaries;
- permission checks;
- database constraints;

unless explicitly required by the task and justified by the existing architecture.

Do not expose secrets, credentials, tokens, environment values, or sensitive internal information.

Do not remove security checks merely to make a test or feature pass.

---

# 16. Scope Discipline

Respect the requested scope.

If the task targets one feature or page:

- do not redesign neighboring pages;
- do not rename unrelated code;
- do not perform opportunistic cleanup;
- do not upgrade packages;
- do not alter architecture unnecessarily.

A small task should normally produce a small diff.

A large diff requires a clear technical reason.

---

# 17. Efficiency

Use context efficiently.

Do not:

- repeatedly inspect files already understood;
- repeatedly search the same documentation;
- repeatedly check known package versions;
- load unrelated rule files;
- narrate routine operations;
- dump large command outputs into the response;
- explain obvious framework behavior unless it materially affects the result.

Prefer targeted inspection over broad repository scanning.

Prefer direct implementation when the requirements and existing patterns are clear.

---

# 18. Communication

Be concise and execution-focused.

Do not narrate every routine action.

Do not provide long explanations before starting work when the task is clear.

When requirements are sufficiently clear, implement the task directly.

Ask for clarification only when a missing decision would materially affect:

- product behavior;
- data integrity;
- security;
- architecture;
- destructive operations;

and cannot safely be inferred from the codebase.

---

# 19. Completion Checklist

Before finalizing a task, confirm as applicable:

- requested behavior is implemented;
- relevant existing conventions are followed;
- no unrelated code was changed;
- no unnecessary dependency was introduced;
- user-facing text is in English;
- relevant tests pass;
- relevant validation/build checks pass;
- modified PHP files are formatted with Pint;
- the final diff contains no accidental changes.

---

# 20. Final Response

Keep the final response short.

Report only:

- what changed;
- important files/areas changed;
- validation performed and result;
- any unresolved issue or required user action, only when relevant.

Do not repeat implementation details that are obvious from the diff.

---

# 21. WhatsApp Management Project Guidelines

This project is a multi-user WhatsApp management system. The authoritative application stack:

- PHP 8.4, Laravel 13, Laravel Fortify, Inertia Laravel v3.
- React 19, TypeScript, Tailwind CSS v4, Laravel Wayfinder.
- MySQL, PHPUnit 12, Laravel Queue, Laravel Scheduler, Laravel public filesystem disk.
- GOWA (`go-whatsapp-web-multidevice`) as a separate WhatsApp gateway.

Laravel is the primary application and source of truth. GOWA only handles WhatsApp session management, QR/pairing, send, receive, and status reporting. Normal users must never access GOWA directly.

Do not add React Router. Laravel and Inertia control routing. Do not create a separate Node.js backend. Do not access the database directly from React.

Do not perform broad dependency upgrades. Do not add dependencies without explicit approval.

## 21.1 Laravel Boost Usage

Before changing Laravel, Inertia, React, authentication, routing, validation, queues, filesystem, rate limiting, or testing code:

1. Inspect existing application conventions.
2. Use Laravel Boost `search-docs` with broad, topic-based queries.
3. Scope documentation searches to the relevant installed packages when appropriate.
4. Implement using the installed package versions.

Prefer Boost tools over manual alternatives whenever an appropriate Boost tool exists (`database-schema`, `database-query`, `browser-logs`, `get-absolute-url`, `search-docs`).

Do not invent framework APIs or rely on examples from older Laravel or Inertia versions.

## 21.2 Product Model

```text
User
  └── Tenant or Workspace
        ├── WhatsApp Device
        ├── Contacts
        ├── Conversations
        ├── Messages
        ├── Bot Rules
        └── Team Members
```

A tenant represents one customer account or workspace. A WhatsApp device represents one connected WhatsApp account. Users may customize device display names but never internal GOWA credentials or headers.

## 21.3 Multi-Tenant Isolation

Use one shared MySQL database with `tenant_id` on every tenant-owned record and `whatsapp_device_id` on every WhatsApp record.

Never trust a `tenant_id` from browser requests, form submissions, URL query parameters, API requests, or GOWA webhook payloads. Resolve the tenant from the authenticated user/current tenant, or from the registered WhatsApp device for webhook processing.

All tenant-owned resource queries must be tenant-scoped. Do not use unscoped lookups such as `WhatsappDevice::findOrFail($id)`. Use a tenant-scoped query plus Laravel Policy authorization.

Super Admin access is still handled explicitly through authorization rules.

## 21.4 Roles

- Global roles: `super_admin`, `user`.
- Tenant roles: `owner`, `admin`, `operator`.

Super Admin manages all users, tenants, and devices. Owner manages their tenant and devices. Admin manages operational tenant resources. Operator accesses assigned conversations. Every protected operation must be authorized in Laravel (middleware, policies, or both), never only hidden frontend actions.

## 21.5 WhatsApp Device Model

Each device has an internal application identifier, a public ULID, a tenant owner, a custom display name, an immutable GOWA device ID, a phone number and JID after connection, application status, connection status, connection timestamps, and safe error information.

Generate GOWA device IDs in Laravel as unpredictable ULIDs formatted `dev_{lowercase_ulid}`. Never use predictable IDs. The browser must never provide an `X-Device-Id` header; Laravel resolves the internal device record and applies its registered GOWA device ID.

Separate application status (`pending`, `active`, `suspended`) from connection status (`waiting_scan`, `connecting`, `connected`, `disconnected`, `logged_out`, `error`). Use PHP enum classes with TitleCase case names.

## 21.6 GOWA Integration Layer

Place GOWA integration classes under `app/Services/Gowa` (`GowaClient`, `GowaDeviceService`, `GowaMessageService`, and webhook handling). Controllers must not contain raw GOWA HTTP logic.

Before implementing any GOWA request, confirm the endpoint, method, headers, payload, response, and webhook shape against the referenced GOWA version. Do not invent GOWA endpoints or payloads. Keep version-specific behavior isolated inside the integration layer.

Store GOWA configuration in environment variables exposed via `config/services.php` (`GOWA_BASE_URL`, `GOWA_USERNAME`, `GOWA_PASSWORD`, `GOWA_WEBHOOK_SECRET`, timeouts). Never pass credentials to Inertia props, commit them, or log passwords/headers/secrets. Use Laravel HTTP Client with explicit connect/request timeouts, safe retry, structured exceptions, and safe logging.

## 21.7 Device Provisioning

1. Authorize the user.
2. Validate the device name and optional description.
3. Verify the tenant device limit.
4. Generate an internal ULID.
5. Generate an immutable GOWA device ID.
6. Create the local device as pending.
7. Register or initialize the device in GOWA.
8. Mark connection status as waiting for scan.
9. Redirect to the device connection page and display QR or pairing info.

Handle partial failure safely: never leave a local device active when remote registration failed. Use a database transaction for local related data, but do not hold a transaction open during long remote HTTP operations.

## 21.8 Webhook Rules

The GOWA webhook endpoint is publicly reachable but protected. Processing must:

1. Read the raw request body.
2. Verify the configured HMAC signature.
3. Decode JSON safely.
4. Validate the event structure.
5. Resolve the device using the GOWA device ID.
6. Derive the tenant from the device record.
7. Ignore/reject unknown devices safely.
8. Store a sanitized webhook log.
9. Prevent duplicate processing.
10. Dispatch heavy processing to a queue.
11. Return a fast HTTP response.

Never derive the tenant from a webhook-provided tenant identifier. Never process synchronously in the controller. Protect `whatsapp_device_id + external_message_id` with database uniqueness. Ignore outgoing messages when required to prevent the bot replying to its own messages.

## 21.9 Queue Rules

Do not send WhatsApp messages synchronously from controllers. Outgoing flow: authorize user/conversation, validate the target device, store the message as `queued`, dispatch a job, send via the GOWA service, save the external message ID, update to `sent`, mark final failures as `failed`.

Minimum jobs: `ProcessIncomingWhatsappMessage`, `SendWhatsappMessage`, `SyncWhatsappDeviceStatus`. Use the database queue. Jobs must use explicit retry limits, sensible backoff, be idempotent, avoid duplicate sends, store safe failure info, avoid logging secrets, and update message state after final failure. Keep queue code compatible with a future Redis migration.

## 21.10 Media Storage

Use Laravel's `public` disk. Store media under `storage/app/public/whatsapp/{tenant_ulid}/{device_ulid}/{year}/{month}/` and expose via `storage:link`. Store only relative filesystem paths in MySQL. Generate filenames with ULIDs/UUIDs; never trust original uploaded filenames. Validate MIME type, extension, size, supported message type, and missing files. Initial supported outbound media: image and document. Keep media operations behind a dedicated class/action so storage can later migrate to S3-compatible storage.

## 21.11 Database Requirements

Core tables: `users`, `tenants`, `tenant_user`, `whatsapp_devices`, `whatsapp_contacts`, `whatsapp_conversations`, `whatsapp_messages`, `bot_rules`, `webhook_logs`, `audit_logs`.

Use foreign keys, unique indexes, composite indexes, reversible migrations, soft deletes where recovery helps, JSON columns only for flexible/raw metadata, explicit Eloquent casts, and PHP enums for controlled statuses.

Frequently used indexes: `tenant_id + status`, `tenant_id + whatsapp_device_id`, `whatsapp_device_id + external_message_id`, `whatsapp_device_id + last_message_at`, `whatsapp_conversation_id + created_at`.

## 21.12 Frontend Requirements

Use the starter's React + Inertia architecture and Wayfinder route functions. Reuse existing layouts, UI components, hooks, and patterns. Do not overdesign the MVP and do not install another UI framework unless approved.

The interface must include clear loading, empty, success, validation-error, disconnected, failed-message, and confirmation states.

## 21.13 Inertia v3

Use current Inertia v3 patterns. Do not use removed APIs such as `Inertia::lazy()`. Use `Inertia::optional()`, deferred props, polling, prefetching, or other v3 features only when appropriate, with skeletons for deferred props. Do not add Axios by default. Real-time WebSockets are outside the MVP; manual refresh or controlled polling is acceptable for the inbox.

## 21.14 Controller Rules

Controllers should only: receive the request, authorize the action, validate via a Form Request, call an application service/action/job, and return an Inertia response, redirect, or JSON response. Do not place large database transactions, raw GOWA HTTP calls, complex bot logic, media download logic, or long webhook processing in controllers. Use explicit return types and typed parameters.

## 21.15 Bot Rules

MVP bot rules are keyword-based per device. Match types: `exact`, `contains`, `starts_with`. Load active rules ordered by priority, normalize incoming text, use the first matching rule, queue one response, ignore messages sent by the connected account, and do not recursively process the bot's own response. Each device has independent rules; a rule from one device must never trigger for another.

## 21.16 Initial Usage Limits

Automated billing is outside the MVP. Limits are configured manually by Super Admin. Suggested defaults: maximum 3 devices, maximum 5 users, maximum 1000 outgoing messages per day, maximum 20 send requests per minute per device. Keep limits configurable and enforce them in Laravel (rate limiting and atomic database updates), never only frontend validation.

## 21.17 Testing Requirements

Use PHPUnit exclusively (no Pest). Use model factories. Every implementation change must have relevant automated tests.

Priority coverage: registration creates a tenant and owner membership; user can/cannot access their own/other tenants; suspended users/tenants cannot operate; owner can create a device within the limit; device limit enforced; user cannot manage another tenant's device; Super Admin can manage all; invalid webhook signatures rejected; unknown devices handled safely; duplicate incoming messages not stored twice; outgoing messages queued; failed sends update status; bot rules isolated per device; media upload validation; unauthorized users cannot access Super Admin routes.

Run the smallest relevant test set while developing; run the affected test after changing it. Do not delete tests without approval. Do not claim a test or build passed unless it was actually executed successfully.

## 21.18 Implementation Phases

Implement one phase at a time:

- Phase 0 — Starter audit (no business features).
- Phase 1 — Tenant foundation, membership, registration, current-tenant resolution, statuses, roles, isolation policies, base navigation.
- Phase 2 — Device management, statuses, GOWA integration, QR/pairing, sync, reconnect, logout, soft delete, limits, mocked GOWA tests.
- Phase 3 — Messaging foundation: contacts, conversations, messages, webhook endpoint, HMAC, webhook logs, incoming/outgoing queues, text sending, duplicate prevention.
- Phase 4 — Inbox and media: conversation list, thread, text reply, image/document upload, public disk storage, failed-message display, retry.
- Phase 5 — Bot rules CRUD and matching.
- Phase 6 — Super Admin management and visibility.
- Phase 7 — Hardening: rate limits, index/security/queue/scheduler/media review, full test suite, production build.

Do not implement later phases during an earlier phase unless the dependency is strictly required and clearly reported.

## 21.19 Task Completion Report

After every implementation task, report concisely: summary, files created, files modified, migrations added, tests added/updated, commands executed, test results, frontend build/lint results, anything not completed, and risks/follow-up tasks. Do not claim success when commands were not executed or failed.

## 21.20 Documentation

Do not create documentation files unless explicitly requested. When explicitly requested, permitted project documentation includes `docs/PROJECT_SPEC.md`, `docs/IMPLEMENTATION_PLAN.md`, and `docs/DECISIONS.md`. Do not create additional documentation files. Keep `.env.example` and `README.md` updated only when the task explicitly includes installation or configuration documentation.
