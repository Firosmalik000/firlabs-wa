<?php

namespace App\Http\Requests;

use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class StoreWhatsappMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var WhatsappConversation|null $whatsappConversation */
        $whatsappConversation = $this->route('whatsappConversation');

        return $this->user() !== null
            && $whatsappConversation !== null
            && $this->user()->can('create', [WhatsappMessage::class, $whatsappConversation]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:4096', 'required_without:media'],
            'media_type' => ['nullable', 'string', 'in:image,document', 'required_with:media'],
            'media' => array_merge(
                ['nullable', 'file', 'required_without:body'],
                $this->mediaValidationRules(),
            ),
        ];
    }

    /**
     * Build the media validation rules based on the requested media type.
     *
     * @return array<int, File|string>
     */
    private function mediaValidationRules(): array
    {
        return match ($this->input('media_type')) {
            'image' => [File::image()->max('10mb')],
            'document' => [File::types(['pdf', 'doc', 'docx'])->max('10mb')],
            default => [File::types(['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'])->max('10mb')],
        };
    }
}
