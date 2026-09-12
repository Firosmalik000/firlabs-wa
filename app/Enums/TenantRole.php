<?php

namespace App\Enums;

enum TenantRole: string
{
    case Admin = 'admin';

    case Owner = 'owner';

    case Operator = 'operator';
}
