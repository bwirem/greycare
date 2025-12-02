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
            
            // Link to the Parent Active Booking (Optional but recommended)
            $table->unsignedBigInteger('opd_booking_id')->nullable()->index();            
           
            $table->dateTime('bookdate')->nullable();

            // We do NOT use foreign keys on Patient in logs usually, 
            // so if a patient is deleted, the log remains.
            $table->string('patientcode', 50)->nullable()->index();

            // Referral
            $table->integer('refered')->default(0);
            $table->string('referedfacility', 255)->nullable();

            // Location
            $table->string('department', 50)->nullable();

            // Treatment Points (Snapshot)
            $table->unsignedBigInteger('treatmentpoint_id')->nullable();
            $table->string('wheretaken', 255)->nullable(); 

            // Billing Snapshots
            $table->unsignedBigInteger('billinggroup_id')->nullable(); 
            $table->string('billinggroup', 255)->nullable();             
           
            $table->unsignedBigInteger('billingsubgroup_id')->nullable();
            $table->string('billingsubgroup', 255)->nullable();            
            $table->string('billinggroupmembershipno', 100)->nullable();

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

            // User
            // Note: If you want to keep logs even if a user is deleted, change this to nullOnDelete
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_booking_logs');
    }
};