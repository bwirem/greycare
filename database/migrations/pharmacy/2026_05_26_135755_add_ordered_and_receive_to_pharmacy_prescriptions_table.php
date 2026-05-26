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
        Schema::table('pharmacy_prescriptions', function (Blueprint $table) {
            // This column will hold the ID of the default death status for IPD discharges.
                $table->double('quantity_ordered', 16, 2)->default(0) 
                    ->after('quantity_prescribed');
                $table->double('quantity_received', 16, 2)->default(0) 
                    ->after('quantity_ordered');
                 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacy_prescriptions', function (Blueprint $table) {
            // This safely drops the foreign key constraint AND the column in one go           
            $table->dropColumn(['quantity_ordered', 'quantity_received']);            
        });
    }
};