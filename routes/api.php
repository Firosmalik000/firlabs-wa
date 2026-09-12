<?php

use App\Http\Controllers\Api\GowaWebhookController;
use App\Http\Middleware\VerifyGowaWebhookSignature;
use Illuminate\Support\Facades\Route;

Route::post('webhooks/gowa', [GowaWebhookController::class, 'store'])
    ->middleware([VerifyGowaWebhookSignature::class])
    ->name('gowa.webhooks.store');
