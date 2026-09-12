<?php

namespace App\Services\Gowa;

use App\Models\WhatsappMessage;

class GowaMessageService
{
    public function __construct(
        private readonly GowaClient $client,
    ) {}

    /**
     * Send a text message through the GOWA boundary.
     *
     * @return array<string, mixed>
     */
    public function sendTextMessage(WhatsappMessage $message): array
    {
        return $this->sendMessage($message);
    }

    /**
     * Send any supported message type through the GOWA boundary.
     *
     * @return array<string, mixed>
     */
    public function sendMessage(WhatsappMessage $message): array
    {
        if ($message->hasMedia()) {
            return $this->client->sendMediaMessage($message);
        }

        return $this->client->sendTextMessage($message);
    }
}
