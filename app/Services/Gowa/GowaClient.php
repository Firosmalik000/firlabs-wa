<?php

namespace App\Services\Gowa;

use App\Models\WhatsappDevice;
use App\Models\WhatsappMessage;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use UnexpectedValueException;

class GowaClient
{
    /**
     * Ensure the Laravel-owned device ID exists as a slot in GOWA.
     */
    public function ensureDevice(WhatsappDevice $device): void
    {
        $response = $this->request()
            ->get('/devices')
            ->throw();
        $registeredDevices = $response->json('results');

        if (! is_array($registeredDevices)) {
            $registeredDevices = [];
        }

        foreach ($registeredDevices as $registeredDevice) {
            if (
                is_array($registeredDevice)
                && in_array($device->gowa_device_id, [
                    $registeredDevice['id'] ?? null,
                    $registeredDevice['device_id'] ?? null,
                ], true)
            ) {
                return;
            }
        }

        $this->registerDevice($device);
    }

    /**
     * @return array<string, mixed>
     */
    public function registerDevice(WhatsappDevice $device): array
    {
        return $this->results(
            $this->request()->post('/devices', [
                'device_id' => $device->gowa_device_id,
            ]),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function startQrPairing(WhatsappDevice $device): array
    {
        return $this->results(
            $this->request()->get($this->devicePath($device).'/login'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function startCodePairing(WhatsappDevice $device, string $phone): array
    {
        return $this->results(
            $this->request()->post(
                $this->devicePath($device).'/login/code?phone='.rawurlencode($phone),
            ),
        );
    }

    public function reconnectDevice(WhatsappDevice $device): void
    {
        $this->request()
            ->post($this->devicePath($device).'/reconnect')
            ->throw();
    }

    public function logoutDevice(WhatsappDevice $device): void
    {
        $this->request()
            ->post($this->devicePath($device).'/logout')
            ->throw();
    }

    public function removeDevice(WhatsappDevice $device): void
    {
        $response = $this->request()->delete($this->devicePath($device));

        if (! $response->notFound()) {
            $response->throw();
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function deviceStatus(WhatsappDevice $device): array
    {
        return $this->results(
            $this->request()->get($this->devicePath($device).'/status'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function deviceInfo(WhatsappDevice $device): array
    {
        return $this->results(
            $this->request()->get($this->devicePath($device)),
        );
    }

    /**
     * Fetch a QR image without exposing the GOWA URL or credentials to users.
     *
     * @return array{contents: string, content_type: string}
     */
    public function downloadQrCode(string $qrUrl): array
    {
        $qrUrl = $this->trustedQrUrl($qrUrl);

        $response = $this->request()
            ->withHeaders(['Accept' => 'image/*'])
            ->get($qrUrl)
            ->throw();

        return [
            'contents' => $response->body(),
            'content_type' => $response->header('Content-Type') ?: 'image/png',
        ];
    }

    /**
     * Send a text message through the GOWA transport boundary.
     *
     * @return array<string, mixed>
     */
    public function sendTextMessage(WhatsappMessage $message): array
    {
        $message->loadMissing(['conversation.device', 'contact']);

        $device = $message->conversation?->device ?? $message->device;
        $contact = $message->contact;
        $body = trim((string) $message->body);

        if ($device === null || $contact === null || $contact->external_id === '' || $body === '') {
            throw new RuntimeException('The WhatsApp message is missing its device, recipient, or body.');
        }

        $results = $this->results(
            $this->request()
                ->withHeader('X-Device-Id', $device->gowa_device_id)
                ->post('/send/message', [
                    'phone' => $contact->external_id,
                    'message' => $body,
                ]),
        );

        $externalMessageId = data_get(
            $results,
            'message_id',
            data_get($results, 'id', data_get($results, 'message.id')),
        );

        if (! is_string($externalMessageId) || $externalMessageId === '') {
            throw new UnexpectedValueException('GOWA did not return a message identifier.');
        }

        return [
            'external_message_id' => $externalMessageId,
            'sent_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Send a media message through the GOWA transport boundary.
     *
     * @return array<string, mixed>
     */
    public function sendMediaMessage(WhatsappMessage $message): array
    {
        $message->loadMissing(['device', 'contact']);

        $device = $message->device;
        $contact = $message->contact;

        if ($device === null || $contact === null || $contact->external_id === '') {
            throw new RuntimeException('The WhatsApp message is missing its device or recipient.');
        }

        if ($message->media_path === null || $message->media_disk === null) {
            throw new RuntimeException('The WhatsApp media message is missing its media file.');
        }

        $filePath = Storage::disk($message->media_disk)->path($message->media_path);

        if (! is_file($filePath)) {
            throw new RuntimeException('The WhatsApp media file no longer exists.');
        }

        $contents = file_get_contents($filePath);

        if ($contents === false) {
            throw new RuntimeException('The WhatsApp media file could not be read.');
        }

        $endpoint = $message->kind === 'image' ? '/send/image' : '/send/file';
        $field = $message->kind === 'image' ? 'image' : 'file';

        $data = ['phone' => $contact->external_id];
        $caption = trim((string) $message->body);

        if ($caption !== '') {
            $data['caption'] = $caption;
        }

        $results = $this->results(
            $this->request()
                ->withHeader('X-Device-Id', $device->gowa_device_id)
                ->attach(
                    $field,
                    $contents,
                    $message->media_original_name ?: basename($message->media_path),
                )
                ->post($endpoint, $data),
        );

        $externalMessageId = data_get(
            $results,
            'message_id',
            data_get($results, 'id', data_get($results, 'message.id')),
        );

        if (! is_string($externalMessageId) || $externalMessageId === '') {
            throw new UnexpectedValueException('GOWA did not return a message identifier.');
        }

        return [
            'external_message_id' => $externalMessageId,
            'sent_at' => now()->toIso8601String(),
        ];
    }

    private function request(): PendingRequest
    {
        $baseUrl = $this->baseUrl();
        $request = Http::baseUrl($baseUrl)
            ->acceptJson()
            ->connectTimeout((int) config('services.gowa.connect_timeout', 5))
            ->timeout((int) config('services.gowa.request_timeout', 30));

        $username = (string) config('services.gowa.username');

        if ($username !== '') {
            $request->withBasicAuth(
                $username,
                (string) config('services.gowa.password'),
            );
        }

        return $request;
    }

    private function baseUrl(): string
    {
        $baseUrl = Str::of((string) config('services.gowa.base_url'))
            ->trim()
            ->rtrim('/')
            ->toString();

        if ($baseUrl === '') {
            throw new RuntimeException('GOWA is not configured. Set GOWA_BASE_URL first.');
        }

        return $baseUrl;
    }

    private function devicePath(WhatsappDevice $device): string
    {
        return '/devices/'.rawurlencode($device->gowa_device_id);
    }

    /**
     * @return array<string, mixed>
     */
    private function results(Response $response): array
    {
        $response->throw();
        $results = $response->json('results');

        if (! is_array($results)) {
            throw new UnexpectedValueException('GOWA returned an invalid response.');
        }

        return $results;
    }

    private function trustedQrUrl(string $qrUrl): string
    {
        $baseParts = parse_url($this->baseUrl());
        $qrParts = parse_url($qrUrl);

        if (
            ! is_array($baseParts)
            || ! is_array($qrParts)
            || Str::lower((string) ($baseParts['scheme'] ?? '')) !== Str::lower((string) ($qrParts['scheme'] ?? ''))
            || Str::lower((string) ($baseParts['host'] ?? '')) !== Str::lower((string) ($qrParts['host'] ?? ''))
            || (isset($qrParts['port']) && $this->port($baseParts) !== $this->port($qrParts))
        ) {
            throw new RuntimeException('GOWA returned an untrusted QR code URL.');
        }

        if (! isset($qrParts['port']) && isset($baseParts['port'])) {
            $path = (string) ($qrParts['path'] ?? '/');
            $query = isset($qrParts['query']) ? '?'.$qrParts['query'] : '';

            return $this->baseUrl().'/'.ltrim($path, '/').$query;
        }

        return $qrUrl;
    }

    /**
     * @param  array<string, mixed>  $parts
     */
    private function port(array $parts): int
    {
        if (isset($parts['port'])) {
            return (int) $parts['port'];
        }

        return Str::lower((string) ($parts['scheme'] ?? '')) === 'https' ? 443 : 80;
    }
}
