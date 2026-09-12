<?php

namespace App\Enums;

enum WhatsappDeviceStatus: string
{
    case Active = 'active';

    case Pending = 'pending';

    case Suspended = 'suspended';
}
