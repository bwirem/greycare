<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_admission_logs', function (Blueprint $table) {
            $table->id(); // Standard ID            
            
            $table->dateTime('transdate')->nullable();

            // ---------------------------------------------------------
            // LINK TO OPD BOOKING (Updated)
            // ---------------------------------------------------------
            $table->foreignId('opd_booking_id')
                  ->nullable()
                  ->constrained('opd_bookings')
                  ->restrictOnDelete();

            $table->string('patientcode', 50)->nullable()->index();           ;

            $table->string('transcode', 50)->nullable();

            // Location Snapshots (IDs)
            $table->foreignId('ward_id')->nullable()->constrained('ipd_wards')->restrictOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('ipd_rooms')->restrictOnDelete();
            $table->foreignId('bed_id')->nullable()->constrained('ipd_beds')->restrictOnDelete();
          
            $table->string('registrystatus', 50)->nullable();
                        
            $table->string('status', 50)->default('open');
            
            $table->foreignId('user_id')->nullable()->constrained('users')->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_admission_logs');
    }
};