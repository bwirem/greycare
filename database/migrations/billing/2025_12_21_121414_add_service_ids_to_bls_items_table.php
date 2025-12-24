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
        Schema::table('bls_items', function (Blueprint $table) {
            $table->unsignedBigInteger('lab_panel_id')->nullable()->after('product_id');
            $table->unsignedBigInteger('rad_procedure_id')->nullable()->after('lab_panel_id');
            $table->unsignedBigInteger('theatre_procedure_id')->nullable()->after('rad_procedure_id');
            $table->unsignedBigInteger('ipd_ward_id')->nullable()->after('theatre_procedure_id');

            // Optional: Add indexes for performance
            $table->index('lab_panel_id');
            $table->index('rad_procedure_id');
            $table->index('theatre_procedure_id');
            $table->index('ipd_ward_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bls_items', function (Blueprint $table) {
            $table->dropColumn(['lab_panel_id', 'rad_procedure_id', 'theatre_procedure_id']);
        });
    }
};

   