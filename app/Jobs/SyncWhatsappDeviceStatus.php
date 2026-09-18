<?php

namespace App\Jobs;

use App\Models\WhatsappDevice;
use App\Services\Gowa\GowaDeviceService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncWhatsappDeviceStatus implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    /**
     * The number of seconds the job remains unique per device.
     */
    public int $uniqueFor = 60;

    /**
     * The number of seconds before a job should timeout.
     */
    public int $timeout = 30;

    /**
     * The maximum number of attempts for the job.
     */
    public int $tries = 2;

    /**
     * The job backoff sequence.
     *
     * @var array<int, int>
     */
    public array $backoff = [10, 60];

    /**
     * Create a new job instance.
     */
    public function __construct(public int $whatsappDeviceId) {}

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return (string) $this->whatsappDeviceId;
    }

    /**
     * Execute the job.
     */
    public function handle(GowaDeviceService $gowaDeviceService): void
    {
        $device = WhatsappDevice::query()->find($this->whatsappDeviceId);

        if ($device === null) {
            return;
        }

        $gowaDeviceService->syncDeviceStatus($device);
    }
}
