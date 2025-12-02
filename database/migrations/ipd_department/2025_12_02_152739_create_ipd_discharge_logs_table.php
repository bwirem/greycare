<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_discharge_logs', function (Blueprint $table) {
            $table->id();

            // Link to Admission Log (Using ID)
            $table->foreignId('ipd_admission_log_id')
                  ->nullable()
                  ->constrained('ipd_admission_logs')
                  ->restrictOnDelete();


            $table->dateTime('SYSDATE')->nullable();
            $table->dateTime('transdate')->nullable();

            // ---------------------------------------------------------
            // LINK TO OPD BOOKING (Updated)
            // ---------------------------------------------------------
            $table->foreignId('opd_booking_id')
                  ->nullable()
                  ->constrained('opd_bookings')
                  ->restrictOnDelete();

            $table->string('patientcode', 50)->nullable()->index();
            $table->string('transcode', 50)->nullable();
            
            // Location at Discharge
            $table->foreignId('ward_id')->nullable()->constrained('ipd_wards')->restrictOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('ipd_rooms')->restrictOnDelete();
            $table->foreignId('bed_id')->nullable()->constrained('ipd_beds')->restrictOnDelete();

            $table->string('patientcondition', 255)->nullable();
            
            // Discharge Status (Linked Table)
            $table->foreignId('discharge_status_id')
                  ->nullable()
                  ->constrained('ipd_discharge_statuses')
                  ->restrictOnDelete();

            $table->string('dischargeremarks', 255)->nullable();            
            $table->string('registrystatus', 50)->nullable();            
           

            $table->foreignId('user_id')->nullable()->constrained('users')->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_discharge_logs');
    }
};