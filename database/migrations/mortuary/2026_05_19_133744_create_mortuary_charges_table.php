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
        Schema::create('mortuary_charges', function (Blueprint $table) {
            $table->id();
            
            // Link to the Mortuary Record
            $table->foreignId('mortuary_record_id')
                  ->constrained('mortuary_records')
                  ->onDelete('cascade');
                  
            // The specific date this charge applies to
            $table->date('charge_date');
            
            // The price charged for that day
            $table->decimal('amount', 10, 2);
            
            $table->timestamps();

            // Optional but highly recommended: 
            // Prevent duplicate charges for the same record on the same day at the database level
            $table->unique(['mortuary_record_id', 'charge_date'], 'unique_daily_mortuary_charge');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mortuary_charges');
    }
};