<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_prescriptions', function (Blueprint $table) {
            $table->id();
            
            // Link to OPD Visit
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->restrictOnDelete();
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions')->restrictOnDelete();
            // Link to Patient
            $table->string('patientcode', 50)->nullable()->index();
            
            // Ordering Doctor
            $table->foreignId('doctor_user_id')->nullable()->constrained('users');

            // The Panel Ordered (e.g. FBP)
            $table->foreignId('lab_panel_id')->constrained('lab_panels')->restrictOnDelete();
            
            // Status Workflow: 'Requested', 'Paid', 'Sample Collected', 'Resulted'
            $table->string('status', 50)->default('Requested');
            
            // Billing Link (Optional: link to specific bill line item)
            $table->unsignedBigInteger('bill_detail_id')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_prescriptions');
    }
};