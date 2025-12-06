<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_donors', function (Blueprint $table) {
            $table->id();
            
            // Unique Donor ID (e.g. DNR-2023-0001)
            $table->string('donor_number', 50)->unique(); 
            
            // Demographics
            $table->string('first_name');
            $table->string('surname');
            $table->string('other_names')->nullable();
            $table->string('gender', 10);
            $table->date('birthdate');
            
            // Contact
            $table->string('contact_no', 50)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('national_id', 50)->nullable();
            
            // Clinical Info
            $table->string('blood_group', 10)->nullable(); // A+, O-, etc.
            $table->double('weight', 8, 2)->default(0); // Kg
            
            // Eligibility Status (Eligible, Deferred, Permanently Deferred)
            $table->string('status', 50)->default('Eligible'); 
            $table->text('deferral_reason')->nullable();
            $table->date('deferral_date')->nullable();

            $table->date('last_donation_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_donors');
    }
};