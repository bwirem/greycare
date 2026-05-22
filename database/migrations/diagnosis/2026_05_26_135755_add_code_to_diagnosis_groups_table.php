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
        Schema::table('dxt_diagnoses_groups', function (Blueprint $table) {
            // This column will hold the ID of the default death status for IPD discharges.
            $table->string('code')
                  ->nullable()
                  ->after('id');
                  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dxt_diagnoses_groups', function (Blueprint $table) {
            // This safely drops the foreign key constraint AND the column in one go
            $table->dropColumn('code');
        });
    }
};