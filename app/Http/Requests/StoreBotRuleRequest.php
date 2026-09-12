<?php

namespace App\Http\Requests;

use App\Enums\BotRuleMatchType;
use App\Models\BotRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBotRuleRequest extends FormRequest
{
    /**
     * Normalize checkbox values before applying Laravel's boolean rule.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => $this->boolean('is_active'),
            ]);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null
            && $this->user()->can('create', BotRule::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenant = $this->user()?->currentTenant;

        return [
            'whatsapp_device_id' => [
                'required',
                'integer',
                Rule::exists('whatsapp_devices', 'id')->where('tenant_id', $tenant?->id),
            ],
            'name' => ['required', 'string', 'max:120'],
            'match_type' => [
                'required',
                'string',
                Rule::in(array_map(
                    static fn (BotRuleMatchType $type): string => $type->value,
                    BotRuleMatchType::cases(),
                )),
            ],
            'trigger_text' => ['required', 'string', 'max:255'],
            'response_text' => ['required', 'string', 'max:4096'],
            'priority' => ['required', 'integer', 'min:0', 'max:10000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
