<?php

namespace App\Enums;

enum WhatsappConnectionStatus: string
{
    case Connected = 'connected';

    case Connecting = 'connecting';

    case Disconnected = 'disconnected';

    case Error = 'error';

    case LoggedOut = 'logged_out';

    case WaitingScan = 'waiting_scan';
}
