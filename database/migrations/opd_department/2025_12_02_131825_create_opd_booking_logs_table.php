<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_booking_logs', function (Blueprint $table) {
            $table->id(); // Unique ID for this log entry
            
            // Link to the Parent Active Booking
            $table->foreignId('opd_booking_id')
                  ->nullable()
                  ->constrained('opd_bookings')
                  ->restrictOnDelete();

                       
            $table->dateTime('bookdate')->nullable();

            // Patient Snapshot
            $table->string('patientcode', 50)->nullable()->index();

            // Referral
            $table->integer('refered')->default(0);
            $table->string('referedfacility', 255)->nullable();

            // Location
            $table->string('department', 50)->nullable();

            // Treatment Points
            $table->unsignedBigInteger('treatmentpoint_id')->nullable();
            $table->string('wheretaken', 255)->nullable(); // Snapshot Name
            
            $table->foreign('treatmentpoint_id')
                  ->references('id')->on('opd_treatmentpoints')
                  ->restrictOnDelete();

            // Billing Group Snapshot
            $table->unsignedBigInteger('billinggroup_id')->nullable(); 
            $table->string('billinggroup', 255)->nullable();             
            $table->foreign('billinggroup_id')
                  ->references('id')->on('patient_billing_groups')
                  ->restrictOnDelete();
           
            // Billing Subgroup Snapshot
            $table->unsignedBigInteger('billingsubgroup_id')->nullable();
            $table->string('billingsubgroup', 255)->nullable();            
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

            // IPD & Status
            $table->dateTime('ipdstart')->nullable();
            $table->dateTime('ipdstop')->nullable();
            $table->string('ipddischargestatus', 50)->nullable();
            $table->string('registrystatus', 50)->nullable();

            // --- DOCTOR INFO (Updated to match main table) ---
            $table->unsignedBigInteger('doctor_user_id')->nullable();
            $table->foreign('doctor_user_id')
                ->references('id')->on('users')
                ->restrictOnDelete();
            
            $table->string('DoctorName', 255)->nullable(); // Snapshot

            // --- VITALS STATUS (Updated) ---
            $table->string('vitalsignstatus', 50)->nullable();

            // User
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_booking_logs');
    }
};