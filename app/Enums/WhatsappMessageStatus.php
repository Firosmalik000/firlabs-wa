<?php

namespace App\Enums;

enum WhatsappMessageStatus: string
{
    case Queued = 'queued';

    case Sending = 'sending';

    case Sent = 'sent';

    case Failed = 'failed';

    case Received = 'received';
}
