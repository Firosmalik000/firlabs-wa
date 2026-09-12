<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->string('media_disk')->nullable()->after('kind');
            $table->string('media_path')->nullable()->after('media_disk');
            $table->string('media_original_name')->nullable()->after('media_path');
            $table->string('media_mime_type')->nullable()->after('media_original_name');
            $table->unsignedBigInteger('media_size')->nullable()->after('media_mime_type');
            $table->timestamp('media_uploaded_at')->nullable()->after('media_size');

            $table->index(['tenant_id', 'kind']);
            $table->index(['tenant_id', 'media_disk']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'kind']);
            $table->dropIndex(['tenant_id', 'media_disk']);
            $table->dropColumn([
                'media_disk',
                'media_path',
                'media_original_name',
                'media_mime_type',
                'media_size',
                'media_uploaded_at',
            ]);
        });
    }
};
