<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_appointments', function (Blueprint $table) {
            $table->id();
            
            // Human Readable Appointment ID (e.g., APT-2025-990)
            $table->string('appointment_number', 50)->unique()->nullable();

            // Link to Patient (File Number)
            $table->string('patientcode', 50)->nullable()->index();
            $table->foreign('patientcode')->references('code')->on('patients')->restrictOnDelete();

            // Who are they seeing?
            $table->foreignId('doctor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('clinic_id')->nullable()->constrained('opd_treatmentpoints')->restrictOnDelete();

            // When?
            $table->dateTime('appointment_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            // Why?
            $table->string('reason', 255)->nullable();
            $table->string('priority', 20)->default('Normal'); // Normal, Urgent

            // Status Workflow
            // Pending, Confirmed, Cancelled, Completed (Converted to Visit), No Show
            $table->string('status', 30)->default('Pending');

            // Link to the Actual Visit (OPD Booking)
            // When an appointment becomes a real visit, we fill this ID
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->nullOnDelete();

            // Meta
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_appointments');
    }
};