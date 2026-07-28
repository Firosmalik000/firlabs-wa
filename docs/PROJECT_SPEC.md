# WhatsApp Multi-User Management System

## Starter Baseline

This repository currently ships with a Laravel 13 + Inertia React starter rather than a blank application.

Confirmed starter pieces include:

- Fortify login, registration, password reset, email verification, two-factor auth, and passkeys.
- Reusable React layouts, forms, UI controls, and settings screens.
- Wayfinder-generated route helpers for the existing auth and settings flow.
- Database queue tables and a sqlite-backed local development database.

The WhatsApp tenant, device, inbox, and GOWA features described below are still to be built on top of that starter.

## 1. Product Objective

Build a clean and maintainable multi-user WhatsApp management application.

The application is intended for a small number of users in its first release but must have a structure that can later evolve into a SaaS product.

Each customer has a workspace.

Each workspace can register one or more WhatsApp devices.

Each device behaves as a separate WhatsApp account with its own:

- Connection.
- Contacts.
- Conversations.
- Messages.
- Media.
- Bot rules.
- Usage statistics.

The application must keep data from different workspaces completely separated.

---

## 2. Technology Stack

### Backend

- Laravel.
- MySQL.
- Laravel Queue.
- Laravel Scheduler.
- Laravel HTTP Client.
- Laravel Policies.
- Laravel Form Requests.

### Frontend

- React.
- Inertia.js.
- TypeScript when supported by the current project.
- Tailwind CSS.

### WhatsApp Gateway

Use GOWA:

`https://github.com/aldinokemal/go-whatsapp-web-multidevice`

GOWA is a separate service.

Laravel is the primary application.

### Media

Use Laravel's public filesystem disk:

```text
storage/app/public
```

Publish it through:

```text
public/storage
```

---

## 3. High-Level Architecture

```text
React/Inertia Browser
        |
        v
Laravel Web Application
        |
        +-- Authentication
        +-- Tenant management
        +-- Device management
        +-- Inbox
        +-- Bot rules
        +-- Administration
        +-- MySQL
        +-- Queue
        |
        v
GOWA Gateway
        |
        v
WhatsApp
```

Incoming event flow:

```text
WhatsApp
   |
   v
GOWA
   |
   v
Laravel Webhook
   |
   v
Queue
   |
   +-- Resolve device and tenant
   +-- Store contact
   +-- Store conversation
   +-- Store message
   +-- Store media
   +-- Execute bot rule
   +-- Queue reply
```

Outgoing event flow:

```text
User submits message
   |
   v
Laravel validates device ownership
   |
   v
Store message as queued
   |
   v
SendWhatsappMessage job
   |
   v
GOWA
   |
   v
WhatsApp
```

---

## 4. User and Workspace Model

### User

A user is a person who logs in to the application.

### Tenant

A tenant is a workspace or customer account.

Examples:

```text
Toko Maju
Klinik Sehat
Customer Service Company A
```

### Initial account flow

When a normal user registers:

1. Create the user.
2. Create one tenant.
3. Attach the user to the tenant as owner.
4. Set that tenant as the user’s current workspace.

### Roles

#### Global role

- `super_admin`
- `user`

#### Tenant role

- `owner`
- `admin`
- `operator`

For the first implementation, owner is required.

Admin and operator can be implemented after the owner flow is stable, but the database structure must support all three.

---

## 5. Database Design

Use ULIDs or UUIDs for public-facing resource identifiers.

Internal numeric primary keys may still be used when consistent with the existing Laravel project, but URLs should not expose predictable identifiers where avoidable.

### 5.1 `users`

Required fields:

```text
id
name
email
email_verified_at nullable
password
global_role
status
current_tenant_id nullable
remember_token
created_at
updated_at
```

Values:

```text
global_role:
- super_admin
- user

status:
- active
- suspended
```

Indexes:

```text
unique email
status
current_tenant_id
```

---

### 5.2 `tenants`

Required fields:

```text
id
ulid
name
slug
status
device_limit
user_limit
daily_message_limit
created_by
created_at
updated_at
deleted_at nullable
```

Default limits for the MVP:

```text
device_limit: 3
user_limit: 5
daily_message_limit: 1000
```

Values:

```text
status:
- active
- suspended
```

Indexes:

```text
unique ulid
unique slug
status
created_by
```

---

### 5.3 `tenant_user`

Required fields:

```text
id
tenant_id
user_id
role
created_at
updated_at
```

Values:

```text
role:
- owner
- admin
- operator
```

Constraints:

```text
unique tenant_id + user_id
```

---

### 5.4 `whatsapp_devices`

Required fields:

```text
id
ulid
tenant_id
name
description nullable
gowa_device_id
phone_number nullable
jid nullable
status
connection_status
is_logged_in
messages_sent_today
messages_received_today
daily_usage_date nullable
last_connected_at nullable
last_disconnected_at nullable
last_status_sync_at nullable
last_error nullable
created_by
created_at
updated_at
deleted_at nullable
```

Values:

```text
status:
- pending
- active
- suspended

connection_status:
- waiting_scan
- connecting
- connected
- disconnected
- logged_out
- error
```

Rules:

- `gowa_device_id` is generated by Laravel.
- `gowa_device_id` is immutable.
- Actual phone number is populated after successful WhatsApp connection.
- Users may customize `name`, but not `gowa_device_id`.
- A suspended device cannot send messages.
- A disconnected device may remain active but cannot send until reconnected.

Indexes:

```text
unique ulid
unique gowa_device_id
tenant_id + status
tenant_id + connection_status
phone_number
jid
```

---

### 5.5 `whatsapp_contacts`

Required fields:

```text
id
ulid
tenant_id
whatsapp_device_id
jid
phone_number nullable
display_name nullable
push_name nullable
profile_picture_path nullable
metadata nullable JSON
last_message_at nullable
created_at
updated_at
```

Constraints:

```text
unique whatsapp_device_id + jid
```

Indexes:

```text
tenant_id + whatsapp_device_id
whatsapp_device_id + last_message_at
phone_number
```

A contact belongs to one device.

The same phone number contacting two devices creates two device-scoped contact records.

---

### 5.6 `whatsapp_conversations`

Required fields:

```text
id
ulid
tenant_id
whatsapp_device_id
whatsapp_contact_id nullable
chat_jid
type
status
assigned_user_id nullable
unread_count
last_message_preview nullable
last_message_at nullable
created_at
updated_at
```

Values:

```text
type:
- private
- group

status:
- open
- pending
- closed
```

Constraints:

```text
unique whatsapp_device_id + chat_jid
```

Indexes:

```text
tenant_id + whatsapp_device_id
whatsapp_device_id + status
whatsapp_device_id + last_message_at
assigned_user_id
```

---

### 5.7 `whatsapp_messages`

Required fields:

```text
id
ulid
tenant_id
whatsapp_device_id
whatsapp_conversation_id
external_message_id nullable
reply_to_external_message_id nullable
direction
message_type
body nullable
caption nullable
media_path nullable
media_mime_type nullable
media_original_name nullable
media_size nullable
status
is_from_me
sent_at nullable
delivered_at nullable
read_at nullable
failed_at nullable
error_code nullable
error_message nullable
raw_payload nullable JSON
created_by nullable
created_at
updated_at
```

Values:

```text
direction:
- incoming
- outgoing

message_type:
- text
- image
- audio
- video
- document
- location
- contact
- sticker
- unknown

status:
- received
- queued
- processing
- sent
- delivered
- read
- failed
```

Constraints:

Use a unique constraint for external messages where supported:

```text
whatsapp_device_id + external_message_id
```

Because outgoing queued messages may not yet have an external ID, handle nullable uniqueness according to MySQL behavior and application-level idempotency.

Indexes:

```text
tenant_id + whatsapp_device_id
whatsapp_conversation_id + created_at
whatsapp_device_id + status
whatsapp_device_id + external_message_id
direction + created_at
```

---

### 5.8 `bot_rules`

Required fields:

```text
id
ulid
tenant_id
whatsapp_device_id
name
keyword
match_type
response_type
response_text nullable
response_media_path nullable
priority
is_active
created_by
created_at
updated_at
deleted_at nullable
```

Values:

```text
match_type:
- exact
- contains
- starts_with

response_type:
- text
- image
- document
```

Initial bot behavior:

1. Load active rules for the target device.
2. Order by priority ascending.
3. Normalize incoming text.
4. Find the first matching rule.
5. Queue one response.
6. Do not trigger rules for messages sent by the connected WhatsApp account.
7. Do not recursively trigger rules from the bot’s own reply.

---

### 5.9 `webhook_logs`

Required fields:

```text
id
ulid
whatsapp_device_id nullable
gowa_device_id nullable
event
external_event_id nullable
signature_valid
processing_status
payload nullable JSON
error_message nullable
received_at
processed_at nullable
created_at
updated_at
```

Values:

```text
processing_status:
- received
- queued
- processed
- ignored
- failed
```

Large payloads may be truncated or sanitized before logging.

Do not log credentials.

---

### 5.10 `audit_logs`

Required fields:

```text
id
tenant_id nullable
user_id nullable
action
subject_type nullable
subject_id nullable
description nullable
old_values nullable JSON
new_values nullable JSON
ip_address nullable
user_agent nullable
created_at
```

Minimum audited actions:

- Tenant suspended or activated.
- Device created.
- Device suspended or activated.
- Device logout.
- Device deletion.
- Team member added or removed.
- Bot rule created, changed, or deleted.

---

## 6. Authentication and Tenant Resolution

Use Laravel session authentication.

After login:

1. Determine the user’s current tenant.
2. Confirm the user still belongs to that tenant.
3. Confirm the tenant is active.
4. Share safe current tenant information with Inertia.
5. Never share secrets or GOWA credentials.

Create middleware similar to:

```text
EnsureUserIsActive
ResolveCurrentTenant
EnsureTenantIsActive
EnsureSuperAdmin
```

Create a helper or service for retrieving the current tenant.

Avoid uncontrolled global state.

---

## 7. Authorization

Create policies for at least:

- Tenant.
- WhatsAppDevice.
- WhatsAppConversation.
- WhatsAppMessage.
- BotRule.
- TenantMember.

Authorization principles:

- Super Admin may manage all tenants and devices.
- Owner may manage their own tenant.
- Admin may manage operational tenant resources.
- Operator may view and reply to conversations but may not delete devices or change security settings.
- A user must never authorize access solely because they know a model ID.

Use route model binding only when the bound model is subsequently authorized and tenant-scoped.

---

## 8. GOWA Integration

### Configuration

Add safe configuration keys to `.env.example`:

```env
GOWA_BASE_URL=http://127.0.0.1:3000
GOWA_USERNAME=
GOWA_PASSWORD=
GOWA_WEBHOOK_SECRET=
GOWA_CONNECT_TIMEOUT=5
GOWA_REQUEST_TIMEOUT=30
```

Map them through `config/services.php`.

Never pass them to Inertia.

### Service classes

Create:

```text
app/Services/Gowa/GowaClient.php
app/Services/Gowa/GowaDeviceService.php
app/Services/Gowa/GowaMessageService.php
app/Services/Gowa/GowaWebhookService.php
```

### Required device operations

Adapt exact routes and payloads to the checked GOWA version:

- Create or register device.
- Request QR login information.
- Request pairing code when supported.
- Read device status.
- Reconnect device.
- Logout device.
- Delete device.
- Retrieve connected account details.

### Required message operations

Initially support:

- Send text message.
- Send image from Laravel public storage.
- Send document from Laravel public storage.

Implement other media types only after the core flow works.

### Device header

For device-scoped GOWA calls, use the registered immutable GOWA device ID according to the version’s documented mechanism.

The browser must never control this header directly.

---

## 9. Device Provisioning Flow

### Create device

1. User enters a device name and optional description.
2. Validate tenant device limit.
3. Generate internal ULID.
4. Generate immutable `gowa_device_id`.
5. Create device as pending.
6. Register the device with GOWA.
7. Set connection status to `waiting_scan`.
8. Redirect to the device connection page.

Use a database transaction for local records.

Handle partial failure when GOWA registration fails.

Do not leave an active local device when remote registration failed.

### Connect device

The device detail page must display:

- Device name.
- Current status.
- QR code or pairing flow.
- Refresh status button.
- Reconnect action.
- Logout action.
- Delete action.
- Connected phone number when available.
- Last connected time.
- Latest safe error information.

Do not continuously poll too aggressively.

Use a reasonable interval and stop polling after connected or terminal failure.

### Delete device

Deleting requires confirmation.

Deletion flow:

1. Authorize owner or admin.
2. Attempt GOWA logout or deletion according to intended action.
3. Record an audit log.
4. Soft-delete the Laravel record where appropriate.
5. Preserve message history unless an explicit permanent-deletion requirement exists.

---

## 10. Webhook Processing

Create an endpoint similar to:

```text
POST /api/webhooks/gowa
```

The final path may follow existing project conventions.

Processing:

1. Read raw body.
2. Verify HMAC signature.
3. Decode JSON safely.
4. Identify event type.
5. Resolve device by `gowa_device_id`.
6. Create a webhook log.
7. Return a fast accepted response.
8. Dispatch processing job.
9. Process message asynchronously.

Message processing job:

1. Confirm device and tenant are active.
2. Ignore message from self when necessary.
3. Normalize sender JID.
4. Upsert contact.
5. Upsert conversation.
6. Use external ID to prevent duplicates.
7. Store incoming message.
8. Download supported media when configured.
9. Update conversation preview and timestamp.
10. Increment unread count.
11. Execute bot rule.
12. Queue outgoing response.

Unknown events should be safely logged and ignored.

---

## 11. Outgoing Message Flow

From the inbox:

1. User selects a device-scoped conversation.
2. User writes a text message or selects a supported media file.
3. Backend authorizes conversation access.
4. Backend validates device connection.
5. Store outgoing message with `queued` status.
6. Dispatch `SendWhatsappMessage`.
7. Job resolves the device internally.
8. Job calls GOWA.
9. Store returned external message ID.
10. Update status to `sent`.
11. On final failure, mark as `failed`.

The frontend should show:

- Queued.
- Sending.
- Sent.
- Delivered when available.
- Read when available.
- Failed with retry action.

---

## 12. Public Media Storage

Use the Laravel `public` disk.

Storage convention:

```text
whatsapp/{tenant_ulid}/{device_ulid}/{YYYY}/{MM}/{generated_filename}
```

Examples:

```text
whatsapp/01tenant/01device/2026/07/01file.jpg
whatsapp/01tenant/01device/2026/07/01file.pdf
```

Database stores:

```text
whatsapp/01tenant/01device/2026/07/01file.jpg
```

Frontend URL is generated using Laravel filesystem helpers.

Upload validation defaults:

```text
image:
- jpg
- jpeg
- png
- webp
- maximum configurable size

document:
- pdf
- doc
- docx
- xls
- xlsx
- txt
- maximum configurable size
```

Do not trust browser MIME data alone.

Generate filenames using ULIDs or UUIDs.

---

## 13. Frontend Pages

### Public pages

```text
/login
/register
/forgot-password
/reset-password
```

### Tenant pages

```text
/dashboard
/devices
/devices/create
/devices/{device}
/devices/{device}/connect
/inbox
/inbox/{conversation}
/contacts
/bot-rules
/bot-rules/create
/bot-rules/{rule}/edit
/team
/settings
```

### Super Admin pages

```text
/admin
/admin/users
/admin/tenants
/admin/tenants/{tenant}
/admin/devices
/admin/devices/{device}
/admin/webhook-logs
/admin/audit-logs
/admin/failed-jobs
```

Use Laravel named routes.

### Main tenant navigation

```text
Dashboard
Devices
Inbox
Contacts
Bot Rules
Team
Settings
```

### Main Super Admin navigation

```text
Dashboard
Users
Tenants
Devices
Webhook Logs
Audit Logs
Failed Jobs
Settings
```

---

## 14. Dashboard Requirements

### Tenant dashboard

Display:

- Total devices.
- Connected devices.
- Disconnected devices.
- Incoming messages today.
- Outgoing messages today.
- Failed messages today.
- Open conversations.
- Recent conversations.
- Recent device errors.

### Super Admin dashboard

Display:

- Total users.
- Active users.
- Total tenants.
- Active tenants.
- Total devices.
- Connected devices.
- Disconnected devices.
- Messages today.
- Failed messages today.
- Recent webhook failures.

Avoid expensive unindexed dashboard queries.

---

## 15. Device Page Requirements

Device list columns:

```text
Name
Phone number
Connection status
Application status
Messages today
Last connected
Actions
```

Actions:

```text
View
Connect
Refresh status
Reconnect
Logout
Suspend or activate
Delete
```

Only show actions the current user is authorized to execute.

---

## 16. Inbox Requirements

Create a simple three-area desktop layout:

```text
Conversation list | Message thread | Contact details
```

On smaller screens, use separate or collapsible panels.

Conversation list must support:

- Device selector.
- Search.
- Open, pending, and closed filters.
- Unread badge.
- Last message preview.
- Last message timestamp.

Message thread must support:

- Incoming and outgoing message distinction.
- Text.
- Images.
- Documents.
- Message timestamps.
- Message delivery status.
- Failed-message retry.
- Text composer.
- Image or document upload.

For the MVP, real-time WebSockets are optional.

Use periodic refresh or manual refresh if real-time infrastructure is not already installed.

Do not add a WebSocket dependency unless explicitly requested.

---

## 17. Bot Rules Interface

Device owner can:

- Select a device.
- Create rule name.
- Enter keyword.
- Select exact, contains, or starts-with matching.
- Enter text response.
- Set priority.
- Activate or deactivate rule.
- Edit rule.
- Delete rule.

Show a clear note that the first matching active rule is used.

Rules must only process messages for their own device.

---

## 18. Super Admin Management

Super Admin can:

### Users

- View users.
- View user tenant memberships.
- Activate or suspend a user.
- View creation and last activity information when available.

### Tenants

- View tenants.
- Open tenant detail.
- Adjust initial limits manually.
- Activate or suspend tenant.
- View tenant devices.
- View tenant usage summary.

### Devices

- View all devices.
- Filter by tenant and connection status.
- Open device details.
- Refresh status.
- Reconnect.
- Suspend or activate.
- Logout.
- Inspect recent safe errors.

Super Admin must not see passwords or decrypted secrets.

---

## 19. Usage Limits

Initial limits are manually managed.

Do not implement automated billing.

Before device creation:

```text
current active device count < tenant device limit
```

Before sending:

- Tenant is active.
- Device is active.
- Device is connected.
- Tenant daily message limit is not exceeded.
- A device or tenant rate limit is not exceeded.

Suggested initial rate limits:

```text
20 send requests per minute per device
1000 outgoing messages per day per tenant
```

Keep these configurable.

Daily counters may be implemented with database counters for the MVP.

Avoid race conditions by using atomic database updates where needed.

---

## 20. Scheduler

Create scheduled device synchronization.

Suggested schedule:

```text
Every five minutes:
- Find active devices.
- Dispatch status sync jobs.
- Avoid overlapping.
```

Status sync:

- Request current GOWA device status.
- Update connection status.
- Update connected number and JID.
- Record last sync.
- Record safe error information.
- Do not suspend a device only because of a temporary network failure.

Document the production scheduler cron requirement.

---

## 21. Error Handling

Create domain exceptions where useful:

```text
GowaConnectionException
GowaAuthenticationException
GowaRequestException
DeviceNotConnectedException
TenantLimitExceededException
InvalidWebhookSignatureException
```

User-facing errors must be understandable.

Technical details belong in application logs.

Do not expose stack traces or credentials to the browser.

---

## 22. MVP Development Phases

### Phase 0 — Repository audit and foundation plan

Deliverables:

- Inspect current repository.
- Identify Laravel and frontend versions.
- Identify installed dependencies.
- Identify current authentication setup.
- Confirm test and build commands.
- Create or update implementation checklist.
- Do not implement business features yet.

### Phase 1 — Authentication, tenant, and authorization

Deliverables:

- Registration and login.
- Tenant creation during registration.
- Tenant membership.
- Current tenant middleware.
- User and tenant statuses.
- Owner and Super Admin authorization.
- Base Inertia layouts.
- Tenant and Super Admin dashboards with placeholder or real basic counts.
- Tenant isolation tests.

### Phase 2 — Device management and GOWA connection

Deliverables:

- Device database model and migration.
- GOWA services.
- Device list and detail pages.
- Add device.
- QR or pairing connection.
- Status synchronization.
- Reconnect.
- Logout.
- Delete or soft-delete.
- Device limit.
- Tests with mocked GOWA HTTP calls.

### Phase 3 — Incoming and outgoing messages

Deliverables:

- Contacts.
- Conversations.
- Messages.
- Webhook validation.
- Webhook logs.
- Incoming processing queue.
- Outgoing send queue.
- Message status handling.
- Text message support.
- Duplicate prevention.
- Tests.

### Phase 4 — Inbox and public media

Deliverables:

- Conversation interface.
- Message thread.
- Text reply.
- Image upload.
- Document upload.
- Public storage structure.
- Incoming supported media storage.
- Failed message state and retry.
- Tests.

### Phase 5 — Bot rules

Deliverables:

- Bot rule CRUD.
- Per-device rule processing.
- Exact, contains, starts-with.
- Priorities.
- Active state.
- Loop prevention.
- Tests.

### Phase 6 — Super Admin management

Deliverables:

- User management.
- Tenant management.
- Device management.
- Manual usage limits.
- Webhook log viewer.
- Audit logs.
- Failed jobs visibility where appropriate.
- Tests.

### Phase 7 — Hardening and deployment documentation

Deliverables:

- Rate limiting.
- Security review.
- Database indexes.
- Queue retry review.
- Scheduler review.
- Public media validation.
- `.env.example`.
- README installation.
- GOWA deployment notes.
- Production checklist.
- Full test and frontend build.

---

## 23. Completion Criteria

The MVP is complete when:

1. Multiple users can register and log in.
2. Each user receives an isolated workspace.
3. An owner can register multiple devices up to their limit.
4. A device can connect to WhatsApp through GOWA.
5. A connected device can receive messages.
6. Incoming messages appear in the correct tenant’s inbox.
7. An owner can reply through the correct device.
8. Text messages are queued and status is recorded.
9. Supported media is stored on Laravel's public disk.
10. Bot rules operate independently per device.
11. Super Admin can manage users, tenants, and devices.
12. A user cannot access another tenant’s records by modifying a URL.
13. Duplicate webhook messages are not stored twice.
14. Invalid webhook signatures are rejected.
15. Backend tests pass.
16. Frontend production build passes.
17. Installation and GOWA configuration are documented.

---

## 24. Explicit Non-Goals

Do not implement these in the MVP:

- Automated subscriptions.
- Payment gateway.
- AI assistant.
- Bulk campaign system.
- Large-scale broadcasting.
- Visual flow builder.
- Multiple GOWA nodes.
- GOWA container provisioning per tenant.
- Public developer API.
- Mobile application.
- WebSocket infrastructure unless already present.
- Cloud object storage.
- Complex analytics.

These features may be added later without changing the core tenant and device architecture.
