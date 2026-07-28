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
        Schema::table('users', function (Blueprint $table) {
            $table->string('global_role')->default('user')->after('password');
            $table->string('status')->default('active')->after('global_role');
            $table->foreignId('current_tenant_id')
                ->nullable()
                ->after('status')
                ->constrained('tenants')
                ->nullOnDelete();
            $table->index('global_role');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('current_tenant_id');
            $table->dropIndex(['global_role']);
            $table->dropIndex(['status']);
            $table->dropColumn(['global_role', 'status']);
        });
    }
};
