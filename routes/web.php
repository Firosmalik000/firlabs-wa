<?php

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
    Route::inertia('dashboard', 'dashboard')
        ->middleware(EnsureTenantIsActive::class)
        ->name('dashboard');

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
            ],
        ]);
    })->name('tenants.show');

    Route::get('admin', function () {
        return Inertia::render('admin/index', [
            'message' => __('Tenant administration is coming soon.'),
        ]);
    })
        ->middleware(EnsureSuperAdmin::class)
        ->name('admin.index');
});

require __DIR__.'/settings.php';
