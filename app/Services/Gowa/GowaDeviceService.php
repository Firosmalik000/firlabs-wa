<?php

namespace App\Services\Gowa;

use App\Enums\WhatsappConnectionStatus;
use App\Enums\WhatsappDeviceStatus;
use App\Models\WhatsappDevice;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Throwable;

class GowaDeviceService
{
    public function __construct(private readonly GowaClient $client) {}

    public function initializeDevice(WhatsappDevice $device): WhatsappDevice
    {
        return $this->startQrPairing($device);
    }

    public function startQrPairing(WhatsappDevice $device): WhatsappDevice
    {
        try {
            $this->client->ensureDevice($device);
            $results = $this->client->startQrPairing($device);
            $qrLink = Arr::get($results, 'qr_link');

            if (! is_string($qrLink) || $qrLink === '') {
                throw new \UnexpectedValueException('GOWA did not return a QR code.');
            }

            $duration = max(1, (int) Arr::get($results, 'qr_duration', 30));

            return $this->saveAndRefresh($device, [
                'status' => WhatsappDeviceStatus::Pending,
                'connection_status' => WhatsappConnectionStatus::WaitingScan,
                'connected_at' => null,
                'last_error_message' => null,
                'last_error_at' => null,
                'metadata' => $this->withPairingMetadata($device, [
                    'mode' => 'qr',
                    'qr_link' => $qrLink,
                    'qr_expires_at' => now()->addSeconds($duration)->toIso8601String(),
                    'requested_at' => now()->toIso8601String(),
                ]),
            ]);
        } catch (Throwable $exception) {
            return $this->markFailed($device, $exception);
        }
    }

    public function startCodePairing(WhatsappDevice $device, string $phone): WhatsappDevice
    {
        try {
            $this->client->ensureDevice($device);
            $results = $this->client->startCodePairing($device, $phone);
            $pairCode = Arr::get($results, 'pair_code');

            if (! is_string($pairCode) || $pairCode === '') {
                throw new \UnexpectedValueException('GOWA did not return a pairing code.');
            }

            return $this->saveAndRefresh($device, [
                'status' => WhatsappDeviceStatus::Pending,
                'connection_status' => WhatsappConnectionStatus::WaitingScan,
                'connected_at' => null,
                'last_error_message' => null,
                'last_error_at' => null,
                'metadata' => $this->withPairingMetadata($device, [
                    'mode' => 'code',
                    'phone' => $phone,
                    'pair_code' => $pairCode,
                    'requested_at' => now()->toIso8601String(),
                ]),
            ]);
        } catch (Throwable $exception) {
            return $this->markFailed($device, $exception);
        }
    }

    public function reconnectDevice(WhatsappDevice $device): WhatsappDevice
    {
        try {
            $this->client->reconnectDevice($device);

            return $this->saveAndRefresh($device, [
                'connection_status' => WhatsappConnectionStatus::Connecting,
                'last_error_message' => null,
                'last_error_at' => null,
            ]);
        } catch (Throwable $exception) {
            return $this->markFailed($device, $exception);
        }
    }

    public function syncDeviceStatus(WhatsappDevice $device): WhatsappDevice
    {
        try {
            $status = $this->client->deviceStatus($device);
            $isConnected = (bool) Arr::get($status, 'is_connected', false);
            $isLoggedIn = (bool) Arr::get($status, 'is_logged_in', false);
            $info = $isLoggedIn ? $this->client->deviceInfo($device) : [];
            $jid = Arr::get($info, 'jid');
            $phoneNumber = Arr::get($info, 'phone_number');

            if ((! is_string($phoneNumber) || $phoneNumber === '') && is_string($jid)) {
                $phoneNumber = Str::before($jid, '@');
            }

            $connectionStatus = match (true) {
                $isLoggedIn => WhatsappConnectionStatus::Connected,
                $isConnected => WhatsappConnectionStatus::Connecting,
                default => WhatsappConnectionStatus::Disconnected,
            };

            return $this->saveAndRefresh($device, [
                'status' => $isLoggedIn ? WhatsappDeviceStatus::Active : $device->status,
                'connection_status' => $connectionStatus,
                'phone_number' => $isLoggedIn && is_string($phoneNumber) ? $phoneNumber : $device->phone_number,
                'whatsapp_jid' => $isLoggedIn && is_string($jid) ? $jid : $device->whatsapp_jid,
                'connected_at' => $isLoggedIn ? ($device->connected_at ?? now()) : null,
                'last_connected_at' => $isLoggedIn ? now() : $device->last_connected_at,
                'last_disconnected_at' => ! $isConnected ? now() : $device->last_disconnected_at,
                'last_error_message' => null,
                'last_error_at' => null,
                'metadata' => $isLoggedIn ? $this->withoutPairingMetadata($device) : $device->metadata,
            ]);
        } catch (Throwable $exception) {
            return $this->markFailed($device, $exception);
        }
    }

    public function logOutDevice(WhatsappDevice $device): WhatsappDevice
    {
        try {
            $this->client->logoutDevice($device);

            return $this->saveAndRefresh($device, [
                'connection_status' => WhatsappConnectionStatus::LoggedOut,
                'connected_at' => null,
                'last_disconnected_at' => now(),
                'metadata' => $this->withoutPairingMetadata($device),
                'last_error_message' => null,
                'last_error_at' => null,
            ]);
        } catch (Throwable $exception) {
            return $this->markFailed($device, $exception);
        }
    }

    public function removeDevice(WhatsappDevice $device): WhatsappDevice
    {
        try {
            $this->client->removeDevice($device);

            return $device;
        } catch (Throwable $exception) {
            return $this->markFailed($device, $exception);
        }
    }

    /**
     * @return array{contents: string, content_type: string}
     */
    public function qrCodeImage(WhatsappDevice $device): array
    {
        $qrLink = Arr::get($device->metadata, 'pairing.qr_link');

        if (! is_string($qrLink) || $qrLink === '') {
            throw new \RuntimeException('No QR code is available for this device.');
        }

        return $this->client->downloadQrCode($qrLink);
    }

    /**
     * @param  array<string, mixed>  $pairing
     * @return array<string, mixed>
     */
    private function withPairingMetadata(WhatsappDevice $device, array $pairing): array
    {
        return [
            ...($device->metadata ?? []),
            'pairing' => $pairing,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function withoutPairingMetadata(WhatsappDevice $device): array
    {
        return Arr::except($device->metadata ?? [], ['pairing']);
    }

    private function markFailed(WhatsappDevice $device, Throwable $exception): WhatsappDevice
    {
        return $this->saveAndRefresh($device, [
            'connection_status' => WhatsappConnectionStatus::Error,
            'last_error_message' => Str::limit($this->safeErrorMessage($exception), 1000),
            'last_error_at' => now(),
        ]);
    }

    private function safeErrorMessage(Throwable $exception): string
    {
        if ($exception instanceof ConnectionException) {
            return __('GOWA service is unreachable. Start the gateway service and try again.');
        }

        if ($exception instanceof RequestException) {
            return __('GOWA rejected the request. Verify the gateway credentials and configuration.');
        }

        return $exception->getMessage();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function saveAndRefresh(WhatsappDevice $device, array $attributes): WhatsappDevice
    {
        $device->forceFill($attributes)->save();

        return $device->refresh();
    }
}
