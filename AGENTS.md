<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- larastan/larastan (LARASTAN) - v3
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This application uses PHPUnit for testing. All tests must be written as PHPUnit classes. Use `php artisan make:test --phpunit {name}` to create a new test.
- If you see a test using "Pest", convert it to PHPUnit.
- Every time a test has been updated, run that singular test.
- When the tests relating to your feature are passing, ask the user if they would like to also run the entire test suite to make sure everything is still passing.
- Tests should cover all happy paths, failure paths, and edge cases.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files; these are core to the application.

## Running Tests

- Run the minimal number of tests, using an appropriate filter, before finalizing.
- To run all tests: `php artisan test --compact`.
- To run all tests in a file: `php artisan test --compact tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --compact --filter=testName` (recommended after making a change to a related file).

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>

# WhatsApp Management Project Guidelines

## Project Purpose

This application is a multi-user WhatsApp management system built on the existing Laravel starter.

The first release is intended for a small number of users, but the architecture must remain organized and extensible so it can later evolve into a SaaS application.

The application uses GOWA as its WhatsApp gateway:

`https://github.com/aldinokemal/go-whatsapp-web-multidevice`

Laravel is the primary application and source of truth.

GOWA is only responsible for:

- WhatsApp session management.
- QR and pairing connections.
- Sending WhatsApp messages.
- Receiving WhatsApp events.
- Reporting connection status.

Normal application users must never access GOWA directly.

---

## Existing Starter Is Authoritative

This project already contains an official Laravel starter and Laravel Boost instructions.

Always preserve and follow the existing:

- Laravel directory structure.
- Authentication implementation.
- React and Inertia conventions.
- TypeScript conventions.
- Tailwind CSS conventions.
- Wayfinder routing conventions.
- PHPUnit testing conventions.
- Formatting and linting configuration.
- Existing reusable components.

Before creating a new component, service, action, middleware, or utility, inspect sibling files and existing implementations.

Do not replace working starter functionality unless explicitly instructed.

Do not perform broad dependency upgrades.

Do not add dependencies without explicit approval.

---

## Required Application Stack

Use the versions and packages already declared by the Laravel Boost guidelines.

The application stack is:

- PHP 8.4.
- Laravel 13.
- Laravel Fortify.
- Inertia Laravel v3.
- React 19.
- TypeScript.
- Tailwind CSS v4.
- Laravel Wayfinder.
- MySQL.
- PHPUnit 12.
- Laravel Queue.
- Laravel Scheduler.
- Laravel public filesystem disk.
- GOWA as a separate WhatsApp gateway.

Do not add React Router.

Laravel and Inertia control application routing.

Do not create a separate Node.js backend.

Do not access the database directly from React.

---

## Laravel Boost Usage

Before changing Laravel, Inertia, React, authentication, routing, validation, queues, filesystem, rate limiting, or testing code:

1. Activate the relevant project skill.
2. Use Laravel Boost `search-docs`.
3. Search using broad topic-based queries.
4. Scope documentation searches to the relevant installed packages when appropriate.
5. Inspect existing application conventions.
6. Implement using the installed package versions.

Prefer Laravel Boost tools over manual alternatives whenever an appropriate Boost tool exists.

Use:

- `database-schema` before changing database structures.
- `database-query` for read-only database investigation.
- `browser-logs` for recent frontend errors.
- `get-absolute-url` before presenting application URLs.
- `search-docs` before implementation.

Do not invent framework APIs or rely on examples from older Laravel or Inertia versions.

---

## Product Model

The application uses the following hierarchy:

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

A tenant represents one customer account or workspace.

A WhatsApp device represents one connected WhatsApp account.

Examples of device display names:

- Customer Service.
- Sales.
- Notifications.
- Collections.

Users may customize a device display name.

Users may not customize or directly control internal GOWA credentials or headers.

---

## Initial Multi-Tenant Approach

Use one shared MySQL database.

Tenant data isolation is implemented using `tenant_id`.

Every tenant-owned business record must include a `tenant_id` where applicable.

Every WhatsApp-related record must include a `whatsapp_device_id` where applicable.

Never trust a `tenant_id` supplied by:

- Browser requests.
- Form submissions.
- URL query parameters.
- API requests.
- GOWA webhook payloads.

Resolve the tenant from:

- The authenticated user and current tenant; or
- The registered WhatsApp device for webhook processing.

All tenant-owned resource queries must be tenant-scoped.

Do not use an unscoped resource lookup such as:

```php
WhatsappDevice::findOrFail($id);
```

Use a tenant-scoped query and Laravel Policy authorization.

Example:

```php
$device = WhatsappDevice::query()
    ->where('tenant_id', $currentTenant->id)
    ->findOrFail($id);

$this->authorize('view', $device);
```

Super Admin access must still be handled explicitly through authorization rules.

---

## Roles

Use two authorization levels.

### Global roles

- `super_admin`
- `user`

### Tenant roles

- `owner`
- `admin`
- `operator`

Initial requirements:

- Super Admin can manage all users, tenants, and devices.
- Owner can manage their tenant and its devices.
- Admin can manage operational tenant resources.
- Operator can access assigned or permitted conversations.

Do not rely only on hidden frontend actions.

Every protected operation must also be authorized in Laravel using middleware, policies, or both.

---

## WhatsApp Device Model

Each WhatsApp device must have:

- An internal application identifier.
- A public ULID when required by existing project conventions.
- A tenant owner.
- A custom display name.
- An immutable GOWA device ID.
- An actual WhatsApp phone number after connection.
- A WhatsApp JID after connection.
- An application status.
- A connection status.
- Connection timestamps.
- Safe error information.

Generate GOWA device IDs in Laravel using unpredictable ULIDs.

Format:

```text
dev_{lowercase_ulid}
```

Example:

```text
dev_01k5ab8c92qpxv37dzm8w0fgst
```

Do not use predictable IDs such as:

```text
device-1
device-2
device-3
```

The browser must never directly provide an `X-Device-Id` header to GOWA.

Laravel resolves the internal device record and applies its registered GOWA device ID.

---

## Device Statuses

Separate application status from connection status.

Suggested application statuses:

- `pending`
- `active`
- `suspended`

Suggested connection statuses:

- `waiting_scan`
- `connecting`
- `connected`
- `disconnected`
- `logged_out`
- `error`

Use PHP enum classes when consistent with the existing application conventions.

Enum case names must use TitleCase according to the Laravel Boost PHP rules.

Example:

```php
enum DeviceStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Suspended = 'suspended';
}
```

---

## GOWA Integration Layer

Place GOWA integration classes within the existing application structure.

Suggested namespace:

```text
app/Services/Gowa
```

Suggested classes:

- `GowaClient`
- `GowaDeviceService`
- `GowaMessageService`
- `GowaWebhookService`

If the existing application uses Actions rather than service classes, follow the existing convention.

Controllers must not contain raw GOWA HTTP integration logic.

Before implementing any GOWA request:

1. Inspect the installed or referenced GOWA version.
2. Inspect its current documentation.
3. Inspect its OpenAPI specification when available.
4. Confirm the endpoint.
5. Confirm the HTTP method.
6. Confirm request headers.
7. Confirm payload shape.
8. Confirm response shape.
9. Confirm webhook payload shape.

Do not invent GOWA endpoints or payloads.

Keep GOWA version-specific behavior isolated inside the integration layer.

---

## GOWA Configuration

Store GOWA configuration in environment variables and Laravel configuration.

Expected variables may include:

```env
GOWA_BASE_URL=http://127.0.0.1:3000
GOWA_USERNAME=
GOWA_PASSWORD=
GOWA_WEBHOOK_SECRET=
GOWA_CONNECT_TIMEOUT=5
GOWA_REQUEST_TIMEOUT=30
```

Expose them through `config/services.php`.

Never pass GOWA credentials to Inertia props.

Never commit credentials to Git.

Never include passwords, authentication headers, or webhook secrets in logs.

Use Laravel HTTP Client with:

- Explicit connection timeout.
- Explicit request timeout.
- Safe retry behavior.
- Structured exceptions.
- Safe logging.

---

## Device Provisioning Flow

Creating a WhatsApp device must follow this flow:

1. Authorize the user.
2. Validate the device name and optional description.
3. Verify the tenant device limit.
4. Generate an internal ULID.
5. Generate an immutable GOWA device ID.
6. Create the local device as pending.
7. Register or initialize the device in GOWA.
8. Mark the connection status as waiting for scan.
9. Redirect the user to the device connection page.
10. Display QR or pairing information according to the supported GOWA version.

Handle partial failure safely.

Do not leave a local device marked active when remote GOWA registration failed.

Use a database transaction for local related data, but do not hold a database transaction open during unnecessarily long remote HTTP operations.

---

## Webhook Rules

The GOWA webhook endpoint is publicly reachable but must be protected.

Webhook processing must:

1. Read the raw HTTP request body.
2. Verify the configured HMAC signature.
3. Decode JSON safely.
4. Validate the event structure.
5. Resolve the registered device using the GOWA device ID.
6. Derive the tenant from the device database record.
7. Ignore or reject unknown devices safely.
8. Store a sanitized webhook log.
9. Prevent duplicate processing.
10. Dispatch heavy processing to a queue.
11. Return a fast HTTP response.

Never derive the tenant from a webhook-provided tenant identifier.

Never perform all message processing synchronously inside the webhook controller.

Create database uniqueness protection for the combination:

```text
whatsapp_device_id + external_message_id
```

Ignore outgoing messages when required to prevent the bot replying to its own messages.

---

## Queue Rules

Do not send WhatsApp messages synchronously from controllers.

Outgoing message flow:

1. Authorize the user and conversation.
2. Validate the target device.
3. Store the outgoing message with `queued` status.
4. Dispatch a queue job.
5. Send through the GOWA integration service.
6. Save the external message ID.
7. Update status to `sent`.
8. Mark final failures as `failed`.

Minimum jobs:

- `ProcessIncomingWhatsappMessage`
- `SendWhatsappMessage`
- `SyncWhatsappDeviceStatus`

Use the database queue initially unless the existing project is already configured differently.

Jobs must:

- Use explicit retry limits.
- Use sensible backoff.
- Be idempotent where practical.
- Avoid duplicate outgoing sends.
- Store safe failure information.
- Avoid logging secrets.
- Update message state after final failure.

Keep queue code compatible with a future migration to Redis.

---

## Media Storage

Use Laravel's `public` filesystem disk.

Store WhatsApp media under:

```text
storage/app/public/whatsapp/{tenant_ulid}/{device_ulid}/{year}/{month}/
```

Expose public files through Laravel's storage link:

```bash
php artisan storage:link
```

Do not write uploaded files directly into arbitrary folders inside `public`.

Store only a relative filesystem path in MySQL.

Generate filenames using ULIDs or UUIDs.

Do not trust original uploaded filenames.

Validate:

- File MIME type.
- File extension.
- File size.
- Supported message type.
- Missing files.
- Failed downloads.

Initial supported outbound media:

- Image.
- Document.

Additional message types can be implemented after the text-message flow is stable.

Keep media operations behind a dedicated class or action so storage can later migrate to S3-compatible storage.

---

## Database Requirements

Initial core tables:

- `users`
- `tenants`
- `tenant_user`
- `whatsapp_devices`
- `whatsapp_contacts`
- `whatsapp_conversations`
- `whatsapp_messages`
- `bot_rules`
- `webhook_logs`
- `audit_logs`

Before adding migrations:

1. Use Boost `database-schema`.
2. Inspect existing migrations.
3. Inspect existing model conventions.
4. Determine whether the application is already initialized.
5. Use Artisan generators.
6. Do not rewrite migrations that may already have run.

Use:

- Foreign keys.
- Unique indexes.
- Composite indexes.
- Reversible migrations.
- Soft deletes where recovery is useful.
- JSON columns only for flexible or raw metadata.
- Explicit Eloquent casts.
- PHP enums for controlled statuses when appropriate.

Frequently used indexes should include:

```text
tenant_id + status
tenant_id + whatsapp_device_id
whatsapp_device_id + external_message_id
whatsapp_device_id + last_message_at
whatsapp_conversation_id + created_at
```

---

## Frontend Requirements

Use the starter's React and Inertia architecture.

Use Wayfinder for Laravel route integration.

Import generated route functions from:

```text
@/actions/
```

or:

```text
@/routes/
```

according to the route type.

Do not manually duplicate Laravel route strings when a generated Wayfinder function exists.

Use reusable components and existing layouts.

Suggested page groups:

```text
resources/js/pages/
├── dashboard/
├── devices/
├── inbox/
├── contacts/
├── bot-rules/
├── team/
├── settings/
└── admin/
```

Follow existing casing and naming conventions rather than forcing this exact structure if the starter uses different conventions.

Required tenant navigation:

- Dashboard.
- Devices.
- Inbox.
- Contacts.
- Bot Rules.
- Team.
- Settings.

Required Super Admin navigation:

- Dashboard.
- Users.
- Tenants.
- Devices.
- Webhook Logs.
- Audit Logs.
- Failed Jobs.

The interface must include clear:

- Loading states.
- Empty states.
- Success feedback.
- Validation errors.
- Disconnected states.
- Failed-message states.
- Confirmation dialogs for destructive actions.

Do not overdesign the MVP.

Do not install another UI framework unless explicitly approved.

---

## Inertia v3 Requirements

Use current Inertia v3 patterns according to Boost documentation search.

Do not use removed APIs.

Do not use `Inertia::lazy()`.

Use `Inertia::optional()`, deferred props, polling, prefetching, or other Inertia v3 features only when appropriate.

When using deferred props, display an appropriate skeleton or loading state.

Do not add Axios by default.

Use the Inertia-supported request mechanisms already available in the starter.

Real-time WebSockets are outside the MVP unless they are already installed and explicitly requested.

For the first inbox version, manual refresh or controlled polling is acceptable.

---

## Controller Rules

Controllers should only:

1. Receive the request.
2. Authorize the action.
3. Use a Form Request for validation.
4. Call an application service, action, or job.
5. Return an Inertia response, redirect, or JSON response.

Do not place:

- Large database transactions.
- Raw GOWA HTTP calls.
- Complex bot logic.
- Media download logic.
- Long webhook-processing logic.

inside controllers.

Use explicit return types and typed parameters according to the PHP rules.

---

## Bot Rules

The MVP bot supports keyword-based responses per device.

Initial match types:

- `exact`
- `contains`
- `starts_with`

Initial behavior:

1. Load active rules belonging to the device.
2. Order them by priority.
3. Normalize the incoming text.
4. Use the first matching rule.
5. Queue one response.
6. Do not process messages sent by the connected WhatsApp account.
7. Do not recursively process the bot’s own response.

Each device has independent bot rules.

A rule from one device must never trigger for another device.

---

## Initial Usage Limits

Automated billing is outside the MVP.

Limits are configured manually by Super Admin.

Suggested initial tenant defaults:

- Maximum 3 devices.
- Maximum 5 users.
- Maximum 1000 outgoing messages per day.
- Maximum 20 send requests per minute per device.

Keep limits configurable.

Enforce limits in Laravel.

Do not depend only on frontend validation.

Use Laravel rate limiting and atomic database updates where appropriate.

---

## Testing Requirements

This project uses PHPUnit exclusively.

Do not use Pest.

Create tests using:

```bash
php artisan make:test --phpunit TestName --no-interaction
```

Use model factories.

Every implementation change must have relevant automated tests.

Priority test coverage:

- Registration creates a tenant and owner membership.
- User can access their own tenant.
- User cannot access another tenant.
- Suspended users cannot continue normally.
- Suspended tenants cannot operate.
- Owner can create a device within the limit.
- Device limit is enforced.
- User cannot manage another tenant's device.
- Super Admin can manage all tenants and devices.
- Invalid webhook signatures are rejected.
- Unknown devices are handled safely.
- Duplicate incoming messages are not stored twice.
- Outgoing messages are queued.
- Failed sends update message status.
- Bot rules are isolated per device.
- Media upload validation works.
- Unauthorized users cannot access Super Admin routes.

Run the smallest relevant test set while developing.

After changing a test, run that specific test.

Do not delete tests without explicit approval.

When PHP files have changed, run:

```bash
vendor/bin/pint --dirty --format agent
```

Also run relevant:

```bash
php artisan test --compact
npm run build
npm run lint
```

according to the scope of the change and available project scripts.

Do not claim a test or build passed unless it was actually executed successfully.

---

## Documentation Rules for This Project

The Laravel Boost guidelines prohibit creating documentation unless explicitly requested.

Documentation creation is explicitly authorized only when the active task specifically requests one or more named documentation files.

When requested, permitted project documentation includes:

```text
docs/PROJECT_SPEC.md
docs/IMPLEMENTATION_PLAN.md
docs/DECISIONS.md
```

Do not create additional documentation files without explicit instruction.

Keep `.env.example` and the existing `README.md` updated only when the task explicitly includes installation or configuration documentation.

---

## MVP Scope

The MVP includes:

- Existing starter authentication.
- Multiple application users.
- One workspace created for each new customer account.
- Tenant membership.
- Owner and Super Admin roles.
- Configurable device limit.
- WhatsApp device registration.
- QR or pairing connection through GOWA.
- Device connection status.
- Incoming text messages.
- Outgoing text messages.
- Contact storage.
- Conversation inbox.
- Image and document media using Laravel public storage.
- Simple per-device keyword bot rules.
- Queue processing.
- Webhook logs.
- Basic usage counters.
- Super Admin user, tenant, and device management.

The MVP excludes:

- Automated subscriptions.
- Payment gateway.
- AI chatbot.
- Visual chatbot flow builder.
- High-volume broadcasting.
- Multiple GOWA nodes.
- One GOWA container per tenant.
- Public developer API.
- Mobile application.
- Omnichannel support.
- White-label support.
- Cloud object storage.
- Complex analytics.
- WebSocket infrastructure unless explicitly requested.

Do not implement an excluded feature without explicit instruction.

---

## Implementation Phases

Implement one phase at a time.

### Phase 0 — Existing Starter Audit

- Inspect the existing starter.
- Inspect Laravel Boost tools and skills.
- Inspect current authentication.
- Inspect current routes.
- Inspect current database.
- Inspect current React and Inertia structure.
- Inspect existing components.
- Inspect test and build commands.
- Create explicitly requested implementation documentation.
- Do not implement business features.

### Phase 1 — Tenant Foundation

- Tenant model and migration.
- Tenant membership.
- Tenant creation during registration.
- Current tenant resolution.
- User and tenant statuses.
- Owner and Super Admin authorization.
- Tenant isolation policies.
- Base tenant and admin navigation.
- PHPUnit tests.

### Phase 2 — Device Management

- WhatsApp device model and migration.
- Device statuses and connection statuses.
- GOWA integration services.
- Device list.
- Device creation.
- QR or pairing connection.
- Status synchronization.
- Reconnect.
- Logout.
- Soft deletion.
- Device limits.
- Mocked GOWA tests.

### Phase 3 — Messaging Foundation

- Contacts.
- Conversations.
- Messages.
- GOWA webhook endpoint.
- HMAC validation.
- Webhook logs.
- Incoming processing queue.
- Outgoing message queue.
- Text sending.
- Duplicate prevention.
- PHPUnit tests.

### Phase 4 — Inbox and Media

- Conversation list.
- Message thread.
- Text reply.
- Image upload.
- Document upload.
- Public disk storage.
- Incoming supported media.
- Failed message display.
- Retry action.
- PHPUnit tests.
- Frontend build.

### Phase 5 — Bot Rules

- Bot rule CRUD.
- Exact matching.
- Contains matching.
- Starts-with matching.
- Priority.
- Active status.
- Loop prevention.
- Device isolation tests.

### Phase 6 — Super Admin

- User management.
- Tenant management.
- Device management.
- Manual limits.
- Webhook log viewer.
- Audit logs.
- Failed jobs visibility.
- Authorization tests.

### Phase 7 — Hardening

- Rate limits.
- Index review.
- Security review.
- Queue retry review.
- Scheduler review.
- Media validation review.
- Environment example update when explicitly requested.
- README update when explicitly requested.
- Production checklist when explicitly requested.
- Full PHPUnit suite.
- Frontend production build.

Do not implement later phases during an earlier phase unless the dependency is strictly required and clearly reported.

---

## Task Completion Report

After every implementation task, report:

1. Summary of completed work.
2. Files created.
3. Files modified.
4. Migrations added.
5. Tests added or updated.
6. Commands executed.
7. Test results.
8. Frontend build or lint results when relevant.
9. Anything not completed.
10. Risks or follow-up tasks.

Keep the report concise.

Do not claim success when commands were not executed or failed.
