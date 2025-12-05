<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_bookings', function (Blueprint $table) {
            $table->id(); // Standard Laravel ID

            $table->dateTime('bookdate')->nullable();
            
            // Patient FK
            $table->string('patientcode', 50)->nullable()->index();
            $table->foreign('patientcode')->references('code')->on('patients')->restrictOnDelete();

            // Referral
            $table->integer('refered')->default(0);
            $table->string('referedfacility', 255)->nullable();

            // Location / Department
            $table->string('department', 50)->nullable();
           
            // Treatment Points
            $table->unsignedBigInteger('treatmentpoint_id')->nullable();
            $table->string('wheretaken', 255)->nullable(); // Snapshot Name

            $table->foreign('treatmentpoint_id')
                  ->references('id')->on('opd_treatmentpoints')
                  ->restrictOnDelete();

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

            // IPD & Status
            $table->dateTime('ipdstart')->nullable();
            $table->dateTime('ipdstop')->nullable();   
            
           // Doctor Info
            $table->unsignedBigInteger('doctor_user_id')->nullable();
            $table->foreign('doctor_user_id')
                ->references('id')->on('users')
                ->restrictOnDelete();
            $table->string('DoctorName', 255)->nullable(); 

            $table->string('vitalsignstatus', 50)->default('Pending')->index(); 

            // User
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_bookings');
    }
};