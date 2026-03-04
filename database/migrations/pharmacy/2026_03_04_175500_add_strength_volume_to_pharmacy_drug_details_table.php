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
        Schema::table('pharmacy_drug_details', function (Blueprint $table) {
            // Add strength_volume after strength_unit
            // Default is 1 to represent "per 1 unit" (e.g., 500mg / 1 tab) and avoid division by zero
            $table->decimal('strength_volume', 12, 4)->default(1)->after('strength_unit')
                  ->comment('The denominator for concentration, e.g., the 5 in 250mg/5ml');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacy_drug_details', function (Blueprint $table) {
            $table->dropColumn('strength_volume');
        });
    }
};