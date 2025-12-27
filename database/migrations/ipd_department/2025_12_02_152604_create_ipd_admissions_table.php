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

            // *** FIXED LINE BELOW ***
            // Changed dateTime() to timestamp() to support useCurrent()
            $table->timestamp('admission_date')->useCurrent();

             // Billing Group
            $table->unsignedBigInteger('billinggroup_id')->nullable(); 
            $table->foreign('billinggroup_id')
                ->references('id')->on('patient_billing_groups')
                ->restrictOnDelete();

            // Billing Subgroup
            $table->unsignedBigInteger('billingsubgroup_id')->nullable();
            $table->foreign('billingsubgroup_id')
                ->references('id')->on('patient_billing_subgroups')
                ->restrictOnDelete();

            $table->string('billinggroupmembershipno', 100)->nullable();
            $table->string('pricecategory', 50)->nullable();

            // Authorization & Scheme
            $table->string('authorizationno', 50)->nullable();
            $table->string('schemeid', 50)->nullable();
            $table->string('schemename', 50)->nullable();
            $table->string('packageid', 50)->nullable();
            $table->string('employeeid', 50)->nullable();

            // Product/Service
            $table->string('productcode', 50)->nullable();
            $table->string('productname', 50)->nullable();

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