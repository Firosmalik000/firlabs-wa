<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BotRuleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\WhatsappDeviceController;
use App\Http\Controllers\WhatsappMessageController;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureTenantIsActive;
use App\Http\Middleware\EnsureUserIsActive;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', EnsureUserIsActive::class])->group(function () {
    Route::get('dashboard', DashboardController::class)
        ->middleware(EnsureTenantIsActive::class)
        ->name('dashboard');

    Route::resource('devices', WhatsappDeviceController::class)
        ->parameters(['devices' => 'whatsappDevice'])
        ->middleware(EnsureTenantIsActive::class);

    Route::post('devices/{whatsappDevice}/reconnect', [WhatsappDeviceController::class, 'reconnect'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('devices.reconnect');

    Route::post('devices/{whatsappDevice}/logout', [WhatsappDeviceController::class, 'logout'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('devices.logout');

    Route::post('devices/{whatsappDevice}/pairing/qr', [WhatsappDeviceController::class, 'startQr'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('devices.pairing.qr');

    Route::post('devices/{whatsappDevice}/pairing/code', [WhatsappDeviceController::class, 'pair'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('devices.pairing.code');

    Route::post('devices/{whatsappDevice}/sync', [WhatsappDeviceController::class, 'sync'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('devices.sync');

    Route::get('devices/{whatsappDevice}/qr-code', [WhatsappDeviceController::class, 'qrCode'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('devices.qr-code');

    Route::post('conversations/{whatsappConversation}/messages', [WhatsappMessageController::class, 'store'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('conversations.messages.store');

    Route::get('inbox', [InboxController::class, 'index'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('inbox.index');

    Route::get('inbox/{whatsappConversation}', [InboxController::class, 'show'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('inbox.show');

    Route::post('messages/{whatsappMessage}/retry', [WhatsappMessageController::class, 'retry'])
        ->middleware(EnsureTenantIsActive::class)
        ->name('messages.retry');

    Route::resource('bot-rules', BotRuleController::class)
        ->parameters(['bot-rules' => 'botRule'])
        ->except(['show'])
        ->middleware(EnsureTenantIsActive::class);

    Route::get('tenants/{tenant}', function (Request $request, Tenant $tenant) {
        Gate::authorize('view', $tenant);

        if (! $tenant->isActive() && ! $request->user()?->isSuperAdmin()) {
            abort(403);
        }

        return Inertia::render('tenants/show', [
            'tenant' => [
                'id' => $tenant->id,
                'ulid' => $tenant->ulid,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'status' => $tenant->status->value,
                'device_limit' => $tenant->device_limit,
            ],
        ]);
    })->name('tenants.show');

    Route::prefix('admin')
        ->name('admin.')
        ->middleware(EnsureSuperAdmin::class)
        ->controller(AdminController::class)
        ->group(function (): void {
            Route::get('/', 'index')->name('index');
            Route::get('users', 'users')->name('users.index');
            Route::patch('users/{user}/status', 'updateUserStatus')->name('users.status.update');
            Route::get('tenants', 'tenants')->name('tenants.index');
            Route::patch('tenants/{tenant}/status', 'updateTenantStatus')->name('tenants.status.update');
            Route::get('devices', 'devices')->name('devices.index');
            Route::get('webhook-logs', 'webhookLogs')->name('webhook-logs.index');
            Route::get('audit-logs', 'auditLogs')->name('audit-logs.index');
            Route::get('failed-jobs', 'failedJobs')->name('failed-jobs.index');
            Route::post('failed-jobs/{failedJob}/retry', 'retryFailedJob')->name('failed-jobs.retry');
            Route::delete('failed-jobs/{failedJob}', 'forgetFailedJob')->name('failed-jobs.destroy');
        });
});

require __DIR__.'/settings.php';
