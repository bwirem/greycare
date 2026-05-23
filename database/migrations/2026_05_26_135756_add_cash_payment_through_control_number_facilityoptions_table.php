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
             $table->integer('cash_payment_control_number')
                    ->nullable()
                    ->after('default_death_status_id')
                    ->default(0);  
              $table->string('control_number_prefix')->nullable()->after('cash_payment_control_number');        
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facilityoptions', function (Blueprint $table) {
            // This safely drops the foreign key constraint AND the column in one go
            $table->dropColumn('cash_payment_control_number'); 
            $table->dropColumn('control_number_prefix');          
            
        });
    }
};