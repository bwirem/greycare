<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. General Differential Diagnoses (Polymorphic - Links to OPD/IPD/Dental tables)
        Schema::create('mr_patient_diagnoses_differential', function (Blueprint $table) {
            $table->id();

            // Link to Booking/Admission/Round
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->restrictOnDelete();
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions')->restrictOnDelete();
            $table->foreignId('ipd_ward_round_id')->nullable()->constrained('ipd_ward_rounds')->nullOnDelete();

            $table->string('patientcode', 50)->nullable()->index();
            $table->dateTime('transdate')->nullable()->index();            

            // Polymorphic Columns
            // diagnosis_id + diagnosis_type (e.g. App\Models\Diagnosis\DxtDiagnosesOpd)
            $table->unsignedBigInteger('diagnosis_id')->nullable()->index(); 
            $table->string('diagnosis_type', 255)->nullable();
            
            $table->string('diagnosisdescription', 255)->nullable();
            
            // Meta
            $table->foreignId('user_id')->nullable()->constrained('users')->restrictOnDelete();         
            $table->string('department', 50)->nullable();

            $table->timestamps();
        });       
    }

    public function down(): void
    {     
        Schema::dropIfExists('mr_patient_diagnoses_differential');
    }
};