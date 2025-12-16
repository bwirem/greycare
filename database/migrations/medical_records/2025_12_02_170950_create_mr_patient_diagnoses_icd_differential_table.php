<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {  
        Schema::create('mr_patient_diagnoses_icd_differential', function (Blueprint $table) {
            $table->id();

            // Link to Booking/Admission/Round
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->restrictOnDelete();
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions')->restrictOnDelete();
            $table->foreignId('ipd_ward_round_id')->nullable()->constrained('ipd_ward_rounds')->nullOnDelete();

            $table->string('patientcode', 50)->nullable()->index();
            $table->dateTime('transdate')->nullable()->index();
           
            // Specific ICD Link
            $table->unsignedBigInteger('diagnosis_id')->nullable()->index(); // Links to dxt_diagnoses_icd
           
            $table->string('diagnosisdescription', 255)->nullable();            
            
            // Meta
            $table->foreignId('user_id')->nullable()->constrained('users')->restrictOnDelete();           
            $table->string('department', 50)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_patient_diagnoses_icd_differential');
       
    }
};