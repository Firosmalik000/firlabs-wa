<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class VerifyGowaWebhookSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('services.gowa.webhook_secret');

        abort_if($secret === '', 503, 'GOWA webhook secret is not configured.');

        $signature = (string) $request->header(
            'X-Hub-Signature-256',
            $request->header('X-Gowa-Signature', ''),
        );
        $signature = Str::after($signature, 'sha256=');
        $computedSignature = hash_hmac('sha256', $request->getContent(), $secret);

        abort_unless($signature !== '' && hash_equals($computedSignature, $signature), 401);

        return $next($request);
    }
}
