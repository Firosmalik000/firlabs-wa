<?php

namespace App\Console\Commands;

use App\Jobs\SyncWhatsappDeviceStatus;
use App\Models\WhatsappDevice;
use Illuminate\Console\Command;

class SyncWhatsappDeviceStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'devices:sync-status {--device= : Only sync a specific device ULID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch WhatsApp device connection status synchronization from GOWA';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $query = WhatsappDevice::query();
        $deviceUlid = $this->option('device');

        if (is_string($deviceUlid) && $deviceUlid !== '') {
            $query->where('ulid', $deviceUlid);
        }

        $dispatched = 0;

        foreach ($query->cursor() as $device) {
            SyncWhatsappDeviceStatus::dispatch($device->id);
            $dispatched++;
        }

        $this->info("Dispatched status sync for {$dispatched} device(s).");

        return self::SUCCESS;
    }
}
