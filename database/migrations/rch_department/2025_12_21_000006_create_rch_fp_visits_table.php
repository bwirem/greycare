<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rch_fp_visits', function (Blueprint $table) {
            $table->id();

            // Link to Patient
            $table->string('patient_code', 50);
            $table->foreign('patient_code')->references('code')->on('patients')->cascadeOnDelete();

            // Link to the specific Hospital Visit (Billing/Reception)
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->restrictOnDelete();

            // Link to the FP Method (Pill, Injection, etc.)
            $table->foreignId('method_id')->constrained('rch_fp_methods')->restrictOnDelete();

            $table->date('visit_date');

            // FP Specific Vitals (Optional, often checked before dispensing hormones)
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->string('bp_systolic', 10)->nullable();
            $table->string('bp_diastolic', 10)->nullable();

            // Dispensing Details
            $table->integer('quantity')->default(1);
            $table->text('side_effects')->nullable(); // Complaints
            $table->date('next_appointment_date')->nullable();

            // Audit
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rch_fp_visits');
    }
};