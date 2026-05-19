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
        Schema::table('facilityoptions', function (Blueprint $table) {
            // This column will hold the ID of the default death status for IPD discharges.
            $table->foreignId('default_death_status_id')
                  ->nullable()
                  ->after('crdb_payment_type')
                  ->constrained('ipd_discharge_statuses')
                  ->nullOnDelete(); // Safely sets to null if the parent status is deleted
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facilityoptions', function (Blueprint $table) {
            // This safely drops the foreign key constraint AND the column in one go
            $table->dropConstrainedForeignId('default_death_status_id');
            
            
        });
    }
};