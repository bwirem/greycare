<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Core Employee Table (Bio Data)
        Schema::create('hrm_employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code', 50)->unique();
            
            // Personal Details
            $table->string('first_name');
            $table->string('last_name');
            $table->string('other_names')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->string('marital_status', 50)->nullable();
            $table->string('national_id', 50)->nullable();
            
            // Contact
            $table->string('phone_number', 50)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('photo_path')->nullable(); 
            
            // System Status
            $table->enum('status', ['Active', 'Terminated', 'Resigned', 'Suspended', 'Deceased', 'OnLeave'])->default('Active');
            $table->timestamps();
        });

        // 2. Next of Kin / Emergency Contacts
        Schema::create('hrm_employee_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hrm_employees')->onDelete('cascade');
            $table->string('name');
            $table->string('relationship'); // e.g. Spouse, Parent
            $table->string('phone_number');
            $table->boolean('is_next_of_kin')->default(false);
            $table->timestamps();
        });

        // 3. Job Details (Department, Position, Salary)
        Schema::create('hrm_employee_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hrm_employees')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('hrm_departments');
            $table->foreignId('position_id')->constrained('hrm_positions');
            
            $table->date('hire_date');
            $table->date('contract_end_date')->nullable();
            $table->string('employment_type')->default('Full-time'); 
            
            // Statutory Numbers
            $table->string('social_security_number')->nullable(); // NSSF No
            $table->string('insurance_number')->nullable();       // NHIF No
            $table->string('tax_identification_number')->nullable(); // KRA PIN
            
            // Base Pay
            $table->decimal('basic_salary', 15, 2)->default(0);
            
            $table->timestamps();
        });

        // 4. Banking Details
        Schema::create('hrm_employee_banking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hrm_employees')->onDelete('cascade');
            $table->foreignId('bank_id')->constrained('hrm_banks');
            $table->string('branch_name')->nullable();
            $table->string('account_number');
            $table->string('account_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hrm_employee_banking');
        Schema::dropIfExists('hrm_employee_jobs');
        Schema::dropIfExists('hrm_employee_contacts');
        Schema::dropIfExists('hrm_employees');
    }
};