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
        Schema::table('theatre_bookings', function (Blueprint $table) {
            // Add the column for Post-Op Diagnosis
            // It links to the 'dxt_diagnoses_icd' table
            $table->foreignId('icd_diagnosis_id')
                  ->nullable() // Nullable because it's empty when first scheduled
                  ->after('status') // Place it after the status column (optional)
                  ->constrained('dxt_diagnoses_icd') // Links to the ICD table
                  ->nullOnDelete(); // If diagnosis is deleted, just set this to null
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('theatre_bookings', function (Blueprint $table) {
            // Drop foreign key first, then the column
            $table->dropForeign(['icd_diagnosis_id']);
            $table->dropColumn('icd_diagnosis_id');
        });
    }
};