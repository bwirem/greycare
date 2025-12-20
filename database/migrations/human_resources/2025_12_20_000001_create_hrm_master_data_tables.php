<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Departments
        Schema::create('hrm_departments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Positions (Job Titles)
        Schema::create('hrm_positions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 3. Banks (Lookup)
        Schema::create('hrm_banks', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->timestamps();
        });

        // 4. Financiers (External Lenders/Saccos)
        Schema::create('pay_financiers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('contact_info')->nullable();
            $table->timestamps();
        });

        // 5. Tax Brackets (PAYE)
        Schema::create('pay_tax_brackets', function (Blueprint $table) {
            $table->id();
            $table->decimal('lower_limit', 15, 2)->default(0);
            $table->decimal('upper_limit', 15, 2)->nullable()->comment('NULL = Infinity');
            $table->decimal('rate', 5, 2)->default(0); // e.g. 30.00 for 30%
            $table->decimal('fixed_amount', 15, 2)->default(0); // Base tax for this band
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. Social Security Types (NSSF, etc.)
        Schema::create('pay_social_security_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name'); // e.g., NSSF
            $table->decimal('employee_rate', 5, 2)->default(0);
            $table->decimal('employer_rate', 5, 2)->default(0);
            $table->decimal('max_deductible_amount', 15, 2)->nullable();
            $table->timestamps();
        });

        // 7. Insurance Types (NHIF, Medical, etc.)
        Schema::create('pay_insurance_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name'); // e.g., NHIF
            $table->decimal('rate', 5, 2)->default(0); // Percentage based
            $table->decimal('fixed_amount', 15, 2)->default(0); // Flat rate
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pay_insurance_types');
        Schema::dropIfExists('pay_social_security_types');
        Schema::dropIfExists('pay_tax_brackets');
        Schema::dropIfExists('pay_financiers');
        Schema::dropIfExists('hrm_banks');
        Schema::dropIfExists('hrm_positions');
        Schema::dropIfExists('hrm_departments');
    }
};