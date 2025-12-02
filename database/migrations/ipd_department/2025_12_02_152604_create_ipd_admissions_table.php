<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_admissions', function (Blueprint $table) {
            $table->id();
            
            // ---------------------------------------------------------
            // LINK TO OPD BOOKING (Updated)
            // ---------------------------------------------------------
            $table->foreignId('opd_booking_id')
                  ->nullable()
                  ->constrained('opd_bookings')
                  ->restrictOnDelete();

            // Link to Patient
            $table->string('patientcode', 50)->nullable()->index();
            $table->foreign('patientcode')->references('code')->on('patients')->restrictOnDelete();

            $table->dateTime('admission_date')->useCurrent();

            // Current Location
            $table->foreignId('ward_id')->nullable()->constrained('ipd_wards')->restrictOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('ipd_rooms')->restrictOnDelete();
            $table->foreignId('bed_id')->nullable()->constrained('ipd_beds')->restrictOnDelete();
               
            $table->string('status', 50)->default('Admitted'); 
            
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_admissions');
    }
};