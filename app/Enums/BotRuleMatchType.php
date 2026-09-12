<?php

namespace App\Enums;

enum BotRuleMatchType: string
{
    case Contains = 'contains';
    case Exact = 'exact';
    case StartsWith = 'starts_with';
}
