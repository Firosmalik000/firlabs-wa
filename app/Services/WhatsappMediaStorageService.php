<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\WhatsappDevice;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WhatsappMediaStorageService
{
    /**
     * Store a media upload on the public disk.
     *
     * @return array{disk:string,path:string,original_name:string,mime_type:string,size:int}
     */
    public function storeUpload(Tenant $tenant, WhatsappDevice $device, UploadedFile $file): array
    {
        $extension = $file->guessExtension() ?: $file->extension() ?: 'bin';
        $directory = sprintf(
            'whatsapp/%s/%s/%s/%s',
            $tenant->ulid,
            $device->ulid,
            now()->format('Y'),
            now()->format('m'),
        );
        $filename = Str::lower((string) Str::ulid()).'.'.$extension;
        $path = $file->storeAs($directory, $filename, 'public');

        return [
            'disk' => 'public',
            'path' => $path ?? $directory.'/'.$filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? $file->getClientMimeType() ?? 'application/octet-stream',
            'size' => $file->getSize() ?: 0,
        ];
    }

    public function publicUrl(?string $path, string $disk = 'public'): ?string
    {
        if ($path === null) {
            return null;
        }

        return Storage::disk($disk)->url($path);
    }
}
