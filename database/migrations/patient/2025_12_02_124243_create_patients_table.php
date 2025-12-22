<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            // 1. Identifiers
            //$table->id(); // Primary Key (BigInt)
            $table->string('code', 50)->primary(); // File Number (e.g., PAT-2025-001)
            $table->string('old_folder_number')->nullable(); // For legacy data migration
            $table->string('national_id', 50)->nullable()->unique();
            $table->string('passport_number', 50)->nullable();

            // 2. Personal Information
            $table->string('title', 10)->nullable(); // Mr, Mrs, Dr, Prof
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name')->index();
            $table->string('gender', 10); // Male, Female, Other
            $table->date('date_of_birth');
            $table->string('marital_status')->nullable(); // Single, Married, Divorced
            $table->string('religion')->nullable();
            $table->string('occupation')->nullable();

            // 3. Contact Information
            $table->string('phone_number')->index();
            $table->string('email')->nullable();
            $table->text('address')->nullable(); // Physical Residence
            $table->string('city')->nullable();
            $table->string('region')->nullable();

            // 4. Next of Kin / Emergency Contact
            $table->string('next_of_kin_name')->nullable();
            $table->string('next_of_kin_relationship')->nullable(); // Spouse, Parent, Sibling
            $table->string('next_of_kin_phone')->nullable();

            // 5. Basic Medical Profile (Summary)
            $table->string('blood_group', 5)->nullable(); // A+, O-, etc.
            $table->string('genotype', 5)->nullable(); // AA, AS, SS (Relevant in some regions)
            $table->text('allergies')->nullable(); // JSON or Comma separated text
            $table->text('chronic_conditions')->nullable(); // e.g. Hypertension, Diabetes
            $table->boolean('has_disability')->default(false);
            $table->text('disability_details')->nullable();

            // 6. Insurance / Payment Info
            // 'Cash', 'Insurance', 'Corporate'
            $table->string('payment_category')->default('Cash');           
            $table->unsignedBigInteger('insurance_provider_id')->nullable()->index();
            $table->string('insurance_provider_name')->nullable(); // Text fallback
            $table->string('insurance_member_no')->nullable();

            // 7. System Status Flags
            $table->string('patient_source')->nullable(); // Walk-in, Referral, Emergency
            $table->boolean('is_admitted')->default(false); // IPD Status
            $table->boolean('is_outpatient')->default(true); // Active in OPD
            $table->boolean('is_deceased')->default(false);
            $table->dateTime('date_of_death')->nullable();

            // 8. Audit & Soft Deletes
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes(); // Archive instead of delete
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};