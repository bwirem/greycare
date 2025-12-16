<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_patient_diagnoses_icd_confirmed', function (Blueprint $table) {
            $table->id();

            // Link to Booking
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->restrictOnDelete();
            // Link to IPD Admission & Ward Round
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions')->restrictOnDelete();
            $table->foreignId('ipd_ward_round_id')->nullable()->constrained('ipd_ward_rounds')->nullOnDelete();

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