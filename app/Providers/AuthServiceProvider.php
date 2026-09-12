<?php

namespace App\Providers;

use App\Models\BotRule;
use App\Models\Tenant;
use App\Models\WhatsappContact;
use App\Models\WhatsappConversation;
use App\Models\WhatsappDevice;
use App\Models\WhatsappMessage;
use App\Policies\BotRulePolicy;
use App\Policies\TenantPolicy;
use App\Policies\WhatsappContactPolicy;
use App\Policies\WhatsappConversationPolicy;
use App\Policies\WhatsappDevicePolicy;
use App\Policies\WhatsappMessagePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Gate::policy(Tenant::class, TenantPolicy::class);
        Gate::policy(BotRule::class, BotRulePolicy::class);
        Gate::policy(WhatsappDevice::class, WhatsappDevicePolicy::class);
        Gate::policy(WhatsappContact::class, WhatsappContactPolicy::class);
        Gate::policy(WhatsappConversation::class, WhatsappConversationPolicy::class);
        Gate::policy(WhatsappMessage::class, WhatsappMessagePolicy::class);
    }
}
