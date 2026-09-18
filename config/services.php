<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gowa' => [
        'base_url' => env('GOWA_BASE_URL'),
        'username' => env('GOWA_USERNAME'),
        'password' => env('GOWA_PASSWORD'),
        'webhook_secret' => env('GOWA_WEBHOOK_SECRET'),
        'webhook_rate_limit' => env('GOWA_WEBHOOK_RATE_LIMIT', 60),
        'connect_timeout' => env('GOWA_CONNECT_TIMEOUT', 5),
        'request_timeout' => env('GOWA_REQUEST_TIMEOUT', 30),
    ],

    'limits' => [
        'outgoing_per_day' => env('OUTGOING_MESSAGES_PER_DAY', 1000),
        'outgoing_per_minute_per_device' => env('OUTGOING_MESSAGES_PER_MINUTE_PER_DEVICE', 20),
    ],

];
