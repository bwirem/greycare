<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_patient_diagnosesicd_confirmed', function (Blueprint $table) {
            $table->id();

            // Link to Booking
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete();

            $table->string('patientcode', 50)->nullable()->index();
            
            $table->dateTime('transdate')->nullable()->index();
           
            // Diagnosis Data
           // 1. The ID from dxt_diagnoses_xxx tables
            $table->unsignedBigInteger('diagnosis_id')->nullable()->index(); 
           //
            $table->string('diagnosisdescription', 255)->nullable();            
            
            // Meta
            $table->foreignId('user_id')->nullable()->constrained('users')->restrictOnDelete();           
            $table->string('department', 50)->nullable();
            

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_patient_diagnosesicd_confirmed');
    }
};