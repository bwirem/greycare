<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theatre_bookings', function (Blueprint $table) {
            $table->id();

            // Link to Visit (OPD) or Admission (IPD)
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->restrictOnDelete();
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions')->restrictOnDelete();
            $table->string('patientcode', 50)->nullable()->index();

            // Procedure Details
            $table->foreignId('theatre_procedure_id')->constrained('theatre_procedures')->restrictOnDelete();
            
            // Personnel
            $table->foreignId('doctor_user_id')->nullable()->constrained('users'); // Surgeon
            $table->foreignId('anesthetist_user_id')->nullable()->constrained('users'); 

            // Schedule / Timing
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('ended_at')->nullable();

            // Location
            $table->string('theatre_room', 50)->nullable(); // e.g. "OT 1"

            // Status: Scheduled, In-Progress, Recovery, Completed, Cancelled
            $table->string('status', 50)->default('Scheduled');

            // "unpaid", "paid", "waived", "insurance"
            $table->string('payment_status', 20)->default('unpaid')->index(); 
             
            $table->text('remarks')->nullable();

            // Billing
            $table->unsignedBigInteger('billing_group_id')->nullable(); 

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theatre_bookings');
    }
};