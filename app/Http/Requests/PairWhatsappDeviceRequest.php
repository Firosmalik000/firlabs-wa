<?php

namespace App\Http\Requests;

use App\Models\WhatsappDevice;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class PairWhatsappDeviceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var WhatsappDevice|null $whatsappDevice */
        $whatsappDevice = $this->route('whatsappDevice');

        return $whatsappDevice !== null && Gate::allows('update', $whatsappDevice);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^[1-9][0-9]{7,14}$/'],
        ];
    }

    /**
     * Normalize common Indonesian local numbers to the international format
     * required by GOWA.
     */
    protected function prepareForValidation(): void
    {
        $phone = Str::of((string) $this->input('phone', ''))
            ->replaceMatches('/[^0-9]/', '')
            ->toString();

        if (Str::startsWith($phone, '0')) {
            $phone = '62'.Str::after($phone, '0');
        }

        $this->merge(['phone' => $phone]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => __('Enter a valid phone number with country code, for example 628123456789.'),
        ];
    }
}
