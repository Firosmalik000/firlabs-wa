<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveCurrentTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = null;

        if ($request->user() !== null) {
            $tenant = $request->user()->currentTenant()->first();

            if (
                $tenant !== null &&
                ! $request->user()->isSuperAdmin() &&
                ! $request->user()->belongsToTenant($tenant)
            ) {
                $tenant = null;
            }
        }

        $request->attributes->set('currentTenant', $tenant);

        return $next($request);
    }
}
