<?php

namespace Tests\Feature;

use App\Enums\GlobalRole;
use App\Enums\TenantRole;
use App\Enums\WhatsappConnectionStatus;
use App\Enums\WhatsappDeviceStatus;
use App\Jobs\SyncWhatsappDeviceStatus;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WhatsappDevice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WhatsappDeviceManagementTest extends TestCase
{
    use RefreshDatabase;

    /** @var array{is_connected: bool, is_logged_in: bool} */
    private array $gowaDeviceStatus = [
        'is_connected' => false,
        'is_logged_in' => false,
    ];

    /** @var array{phone_number: string, jid: string}|null */
    private ?array $gowaDeviceInfo = null;

    /** @var list<array{id?: string, device_id?: string}>|null */
    private ?array $gowaRegisteredDevices = null;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.gowa.base_url' => 'http://gowa.test',
            'services.gowa.username' => 'admin',
            'services.gowa.password' => 'secret',
        ]);

        Http::preventStrayRequests();
        Http::fake(function (Request $request) {
            $url = $request->url();

            if ($request->method() === 'GET' && Str::endsWith($url, '/login')) {
                return Http::response([
                    'results' => [
                        'qr_link' => 'http://gowa.test/qr/device.png',
                        'qr_duration' => 60,
                    ],
                ]);
            }

            if (
                $request->method() === 'GET'
                && in_array($url, [
                    'http://gowa.test/qr/device.png',
                    'http://gowa.test:3000/qr/device.png',
                ], true)
            ) {
                return Http::response('png-binary', 200, ['Content-Type' => 'image/png']);
            }

            if ($request->method() === 'GET' && Str::endsWith($url, '/status')) {
                return Http::response(['results' => $this->gowaDeviceStatus]);
            }

            if ($request->method() === 'GET' && $url === 'http://gowa.test/devices') {
                return Http::response(['results' => $this->gowaRegisteredDevices]);
            }

            if ($request->method() === 'GET' && preg_match('#/devices/dev_[^/]+$#', $url) === 1) {
                if ($this->gowaDeviceInfo !== null) {
                    return Http::response(['results' => $this->gowaDeviceInfo]);
                }

                return Http::response([], 404);
            }

            if ($request->method() === 'POST' && Str::contains($url, '/login/code')) {
                return Http::response([
                    'results' => ['pair_code' => '1234-5678'],
                ]);
            }

            if ($request->method() === 'POST' && $url === 'http://gowa.test/devices') {
                $this->gowaRegisteredDevices ??= [];
                $this->gowaRegisteredDevices[] = [
                    'id' => (string) $request['device_id'],
                ];

                return Http::response([
                    'results' => [
                        'device_id' => $request['device_id'],
                    ],
                ]);
            }

            return Http::response(['results' => []]);
        });
    }

    public function test_workspace_owner_can_create_a_device_within_the_limit(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $response = $this->actingAs($owner)->post(route('devices.store'), [
            'display_name' => 'Sales',
            'description' => 'Primary sales device',
        ]);

        $response->assertRedirect();

        $device = WhatsappDevice::query()
            ->where('tenant_id', $tenant->id)
            ->where('display_name', 'Sales')
            ->firstOrFail();

        $this->assertSame($owner->id, $device->created_by);
        $this->assertSame(WhatsappDeviceStatus::Pending, $device->status);
        $this->assertSame(
            WhatsappConnectionStatus::WaitingScan,
            $device->connection_status,
        );
        $this->assertStringStartsWith('dev_', $device->gowa_device_id);
        $this->assertSame('qr', data_get($device->metadata, 'pairing.mode'));
        $this->assertSame(
            'http://gowa.test/qr/device.png',
            data_get($device->metadata, 'pairing.qr_link'),
        );

        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && $request->url() === 'http://gowa.test/devices'
            && $request['device_id'] === $device->gowa_device_id);
    }

    public function test_existing_gowa_device_is_not_registered_twice(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);

        $this->gowaRegisteredDevices = [
            ['id' => $device->gowa_device_id],
        ];

        $this->actingAs($owner)
            ->post(route('devices.pairing.qr', $device))
            ->assertRedirect();

        Http::assertNotSent(fn (Request $request): bool => $request->method() === 'POST'
            && $request->url() === 'http://gowa.test/devices');
    }

    public function test_workspace_owner_can_update_and_delete_a_device(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'display_name' => 'Sales',
        ]);

        $this->actingAs($owner)
            ->from(route('devices.edit', $device))
            ->patch(route('devices.update', $device), [
                'display_name' => 'Sales Team',
                'description' => 'Updated description',
            ])
            ->assertRedirect(route('devices.show', $device, absolute: false));

        $device->refresh();

        $this->assertSame('Sales Team', $device->display_name);
        $this->assertSame('Updated description', $device->description);

        $this->actingAs($owner)
            ->from(route('devices.show', $device))
            ->delete(route('devices.destroy', $device))
            ->assertRedirect(route('devices.index'));

        $this->assertSoftDeleted($device);
    }

    public function test_workspace_owner_can_reconnect_and_logout_a_device(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);

        $this->actingAs($owner)
            ->post(route('devices.reconnect', $device))
            ->assertRedirect();

        $device->refresh();

        $this->assertSame(WhatsappDeviceStatus::Pending, $device->status);
        $this->assertSame(
            WhatsappConnectionStatus::Connecting,
            $device->connection_status,
        );

        $this->actingAs($owner)
            ->post(route('devices.logout', $device))
            ->assertRedirect();

        $device->refresh();

        $this->assertSame(
            WhatsappConnectionStatus::LoggedOut,
            $device->connection_status,
        );
    }

    public function test_device_limit_is_enforced(): void
    {
        [$tenant, $owner] = $this->createTenantOwner([
            'device_limit' => 1,
        ]);

        WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);

        $response = $this->actingAs($owner)->post(route('devices.store'), [
            'display_name' => 'Second Device',
            'description' => null,
        ]);

        $response->assertSessionHasErrors('display_name');

        $this->assertDatabaseCount('whatsapp_devices', 1);
    }

    public function test_users_cannot_manage_devices_from_other_tenants(): void
    {
        [, $owner] = $this->createTenantOwner();
        $otherTenant = Tenant::factory()->create();

        $device = WhatsappDevice::factory()->for($otherTenant)->create();

        $this->actingAs($owner)
            ->get(route('devices.show', $device))
            ->assertForbidden();

        $this->actingAs($owner)
            ->patch(route('devices.update', $device), [
                'display_name' => 'Blocked',
                'description' => null,
            ])
            ->assertForbidden();

        $this->actingAs($owner)
            ->post(route('devices.pairing.code', $device), [
                'phone' => '081234567890',
            ])
            ->assertForbidden();
    }

    public function test_owner_can_request_a_pairing_code_with_a_normalized_phone_number(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);

        $this->actingAs($owner)
            ->post(route('devices.pairing.code', $device), [
                'phone' => '0812 3456-7890',
            ])
            ->assertRedirect();

        $device->refresh();

        $this->assertSame('code', data_get($device->metadata, 'pairing.mode'));
        $this->assertSame('6281234567890', data_get($device->metadata, 'pairing.phone'));
        $this->assertSame('1234-5678', data_get($device->metadata, 'pairing.pair_code'));

        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && $request->url() === 'http://gowa.test/devices/'.$device->gowa_device_id.'/login/code?phone=6281234567890');
    }

    public function test_sync_updates_the_verified_phone_number_after_gowa_login(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'phone_number' => null,
            'whatsapp_jid' => null,
        ]);

        $this->gowaDeviceStatus = [
            'is_connected' => true,
            'is_logged_in' => true,
        ];
        $this->gowaDeviceInfo = [
            'phone_number' => '6281234567890',
            'jid' => '6281234567890@s.whatsapp.net',
        ];

        $this->actingAs($owner)
            ->post(route('devices.sync', $device))
            ->assertRedirect();

        $device->refresh();

        $this->assertSame(WhatsappDeviceStatus::Active, $device->status);
        $this->assertSame(WhatsappConnectionStatus::Connected, $device->connection_status);
        $this->assertSame('6281234567890', $device->phone_number);
        $this->assertSame('6281234567890@s.whatsapp.net', $device->whatsapp_jid);
        $this->assertNotNull($device->connected_at);
    }

    public function test_sync_status_job_updates_device_connection_status(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'status' => WhatsappDeviceStatus::Pending,
            'connection_status' => WhatsappConnectionStatus::Disconnected,
            'phone_number' => null,
            'whatsapp_jid' => null,
        ]);

        $this->gowaDeviceStatus = [
            'is_connected' => true,
            'is_logged_in' => true,
        ];
        $this->gowaDeviceInfo = [
            'phone_number' => '6281234567890',
            'jid' => '6281234567890@s.whatsapp.net',
        ];

        app()->call([new SyncWhatsappDeviceStatus($device->id), 'handle']);

        $device->refresh();

        $this->assertSame(WhatsappDeviceStatus::Active, $device->status);
        $this->assertSame(WhatsappConnectionStatus::Connected, $device->connection_status);
        $this->assertSame('6281234567890', $device->phone_number);
    }

    public function test_sync_status_command_dispatches_jobs_for_all_devices(): void
    {
        Bus::fake();

        [$tenant, $owner] = $this->createTenantOwner();
        $first = WhatsappDevice::factory()->for($tenant)->create([
            'gowa_device_id' => 'dev_sync_a',
        ]);
        $second = WhatsappDevice::factory()->for($tenant)->create([
            'gowa_device_id' => 'dev_sync_b',
        ]);

        $this->artisan('devices:sync-status')->assertExitCode(0);

        Bus::assertDispatched(SyncWhatsappDeviceStatus::class, fn (SyncWhatsappDeviceStatus $job): bool => $job->whatsappDeviceId === $first->id);
        Bus::assertDispatched(SyncWhatsappDeviceStatus::class, fn (SyncWhatsappDeviceStatus $job): bool => $job->whatsappDeviceId === $second->id);
    }

    public function test_device_creation_writes_an_audit_log(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $this->actingAs($owner)
            ->post(route('devices.store'), [
                'display_name' => 'Sales',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'device.created',
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
        ]);
    }

    public function test_device_page_proxies_the_qr_without_exposing_the_gowa_url(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'metadata' => [
                'pairing' => [
                    'mode' => 'qr',
                    'qr_link' => 'http://gowa.test/qr/device.png',
                    'requested_at' => now()->toIso8601String(),
                    'qr_expires_at' => now()->addMinute()->toIso8601String(),
                ],
            ],
        ]);

        $this->actingAs($owner)
            ->get(route('devices.show', $device))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('device.pairing.mode', 'qr')
                ->where('device.pairing.qr_available', true)
                ->missing('device.metadata'),
            );

        $this->actingAs($owner)
            ->get(route('devices.qr-code', $device))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png')
            ->assertContent('png-binary');
    }

    public function test_expired_qr_codes_are_not_displayed_or_proxied(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'metadata' => [
                'pairing' => [
                    'mode' => 'qr',
                    'qr_link' => 'http://gowa.test/qr/device.png',
                    'requested_at' => now()->subMinutes(2)->toIso8601String(),
                    'qr_expires_at' => now()->subMinute()->toIso8601String(),
                ],
            ],
        ]);

        $this->actingAs($owner)
            ->get(route('devices.show', $device))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('device.pairing.qr_available', false),
            );

        $this->actingAs($owner)
            ->get(route('devices.qr-code', $device))
            ->assertGone();

        Http::assertNothingSent();
    }

    public function test_untrusted_qr_urls_are_not_requested(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'metadata' => [
                'pairing' => [
                    'mode' => 'qr',
                    'qr_link' => 'http://untrusted.example/qr.png',
                    'qr_expires_at' => now()->addMinute()->toIso8601String(),
                ],
            ],
        ]);

        $this->actingAs($owner)
            ->get(route('devices.qr-code', $device))
            ->assertStatus(502);

        Http::assertNothingSent();
    }

    public function test_qr_url_without_the_configured_port_uses_the_gowa_origin(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        config(['services.gowa.base_url' => 'http://gowa.test:3000']);

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
            'metadata' => [
                'pairing' => [
                    'mode' => 'qr',
                    'qr_link' => 'http://gowa.test/qr/device.png',
                    'qr_expires_at' => now()->addMinute()->toIso8601String(),
                ],
            ],
        ]);

        $this->actingAs($owner)
            ->get(route('devices.qr-code', $device))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png')
            ->assertContent('png-binary');

        Http::assertSent(fn (Request $request): bool => $request->url() === 'http://gowa.test:3000/qr/device.png');
    }

    public function test_local_device_is_preserved_when_remote_removal_fails(): void
    {
        [$tenant, $owner] = $this->createTenantOwner();

        $device = WhatsappDevice::factory()->for($tenant)->create([
            'created_by' => $owner->id,
        ]);

        config(['services.gowa.base_url' => null]);

        $this->actingAs($owner)
            ->from(route('devices.show', $device))
            ->delete(route('devices.destroy', $device))
            ->assertRedirect(route('devices.show', $device));

        $device->refresh();

        $this->assertNull($device->deleted_at);
        $this->assertSame(WhatsappConnectionStatus::Error, $device->connection_status);
        $this->assertStringContainsString('GOWA is not configured', $device->last_error_message);
    }

    public function test_super_admins_can_view_all_devices(): void
    {
        $superAdmin = User::factory()->create([
            'global_role' => GlobalRole::SuperAdmin->value,
            'current_tenant_id' => null,
        ]);

        $firstTenant = Tenant::factory()->create();
        $secondTenant = Tenant::factory()->create();

        WhatsappDevice::factory()->for($firstTenant)->create();
        WhatsappDevice::factory()->for($secondTenant)->create();

        $this->actingAs($superAdmin)
            ->get(route('devices.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('devices/index')
                ->where('canManageAll', true)
                ->where('tenant', null)
                ->has('devices', 2),
            );
    }

    /**
     * @return array{0: Tenant, 1: User}
     */
    private function createTenantOwner(array $tenantAttributes = [], array $userAttributes = []): array
    {
        $tenant = Tenant::factory()->create($tenantAttributes);

        $user = User::factory()->create(array_merge([
            'current_tenant_id' => $tenant->id,
        ], $userAttributes));

        $tenant->users()->attach($user->id, [
            'role' => TenantRole::Owner->value,
        ]);

        return [$tenant, $user];
    }
}
