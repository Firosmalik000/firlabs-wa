<?php

namespace App\Enums;

enum TenantRole: string
{
    case Admin = 'admin';

    case Operator = 'operator';

    case Owner = 'owner';
}
