<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theatre_post_op_arrivals', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('theatre_booking_id')->constrained('theatre_bookings')->cascadeOnDelete();
            
            // Consciousness
            $table->boolean('is_awake')->default(false);
            $table->boolean('is_rousable')->default(false);
            $table->boolean('is_unconscious')->default(false);
            
            // Comfort
            $table->boolean('is_in_pain')->default(false);
            $table->boolean('is_calm')->default(false);

            // Airway Management
            $table->boolean('airway_intact')->default(false);
            $table->boolean('nasal_airway')->default(false);
            $table->boolean('oral_airway')->default(false);
            $table->boolean('tracheostomy')->default(false);
            $table->boolean('ventilated')->default(false);

            // Ventilation Settings (if ventilated)
            $table->integer('tv')->default(0); // Tidal Volume
            $table->integer('rr')->default(0); // Resp Rate
            $table->integer('paw')->default(0); // Peak Airway Pressure
            $table->integer('peep')->default(0);

            // Output / Drains
            $table->boolean('urinary_catheter')->default(false);
            $table->boolean('drains')->default(false);
            $table->string('drain_site', 100)->nullable();

            // Vitals on Arrival
            $table->string('bp', 20)->nullable();
            $table->integer('heart_rate')->default(0);
            $table->integer('resp_rate')->default(0);
            $table->decimal('temperature', 5, 2)->default(0);
            $table->integer('spo2')->default(0);

            $table->foreignId('nurse_user_id')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theatre_post_op_arrivals');
    }
};