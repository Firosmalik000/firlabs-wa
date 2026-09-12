<?php

namespace App\Jobs;

use App\Enums\WhatsappMessageStatus;
use App\Models\WhatsappMessage;
use App\Services\Gowa\GowaMessageService;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class SendWhatsappMessage implements ShouldBeUniqueUntilProcessing, ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $whatsappMessageId) {}

    /**
     * The number of seconds the job remains unique.
     */
    public int $uniqueFor = 3600;

    /**
     * The number of seconds before a job should timeout.
     */
    public int $timeout = 30;

    /**
     * The maximum number of attempts for the job.
     */
    public int $tries = 3;

    /**
     * The job backoff sequence.
     *
     * @var array<int, int>
     */
    public array $backoff = [5, 15, 30];

    /**
     * Execute the job.
     */
    public function handle(GowaMessageService $gowaMessageService): void
    {
        $message = WhatsappMessage::query()
            ->with(['conversation.device', 'contact', 'tenant'])
            ->findOrFail($this->whatsappMessageId);

        if ($message->status !== WhatsappMessageStatus::Queued) {
            return;
        }

        $message->markAsSending();

        $response = $gowaMessageService->sendMessage($message);

        $message->markAsSent($response['external_message_id'] ?? null);
    }

    /**
     * Mark the message as failed when the job errors.
     */
    public function failed(Throwable $exception): void
    {
        $message = WhatsappMessage::query()->find($this->whatsappMessageId);

        if ($message === null) {
            return;
        }

        $message->markAsFailed($exception->getMessage());
    }
}
