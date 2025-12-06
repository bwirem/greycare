<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_blood_bags', function (Blueprint $table) {
            $table->id();

            // Source (Donation)
            $table->foreignId('bb_donation_id')->constrained('bb_donations')->cascadeOnDelete();
            
            // What is in this bag?
            $table->foreignId('bb_component_type_id')->constrained('bb_component_types');
            
            // Identification
            $table->string('bag_serial_number', 50); // Same as donation or suffixed (e.g. 1001-A)
            $table->string('blood_group', 10); // A+, AB-, etc.
            
            // Dates
            $table->dateTime('collected_at');
            $table->dateTime('expires_at');
            
            // Screening Results (TTI - Transfusion Transmissible Infections)
            // HIV, HCV, HBV, Syphilis
            $table->boolean('is_screened')->default(false);
            $table->boolean('is_safe')->default(false); // True = Negative for all diseases
            
            // Current Status
            // Available, Reserved, Transfused, Expired, Discarded
            $table->string('status', 50)->default('Quarantine'); 
            
            // Location (Fridge)
            $table->string('location', 50)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_blood_bags');
    }
};