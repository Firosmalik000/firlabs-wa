<?php

namespace App\Enums;

enum GlobalRole: string
{
    case SuperAdmin = 'super_admin';

    case User = 'user';
}
