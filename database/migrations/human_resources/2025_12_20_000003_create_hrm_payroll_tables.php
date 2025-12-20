<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Employee Loans
        Schema::create('pay_employee_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hrm_employees')->onDelete('cascade');
            $table->foreignId('financier_id')->nullable()->constrained('pay_financiers'); // Null if company loan
            
            $table->string('loan_reference')->nullable();
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2)->default(0);
            $table->decimal('monthly_installment', 15, 2);
            $table->decimal('current_balance', 15, 2);
            
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true); // False when fully paid
            $table->timestamps();
        });

        // 2. Attendance Records
        Schema::create('hrm_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hrm_employees')->onDelete('cascade');
            $table->date('attendance_date');
            $table->dateTime('clock_in')->nullable();
            $table->dateTime('clock_out')->nullable();
            $table->decimal('hours_worked', 5, 2)->default(0);
            $table->enum('status', ['Present', 'Absent', 'Late', 'Leave', 'Holiday'])->default('Absent');
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Index for faster reporting queries by date and employee
            $table->index(['attendance_date', 'employee_id']);
        });

        // 3. Payroll Periods (The 'Month' bucket)
        Schema::create('pay_payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique(); // e.g. 2025-01
            $table->string('name'); // e.g. January 2025
            $table->date('start_date');
            $table->date('end_date');
            $table->date('pay_date')->nullable();
            $table->enum('status', ['Draft', 'Processing', 'Approved', 'Paid'])->default('Draft');
            $table->timestamps();
        });

        // 4. Payslips (One per employee per period)
        Schema::create('pay_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained('pay_payroll_periods')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('hrm_employees');
            
            // Snapshot Data (History preservation)
            $table->string('job_title_snapshot')->nullable();
            $table->string('department_snapshot')->nullable();
            
            // Totals
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->decimal('total_allowances', 15, 2)->default(0);
            $table->decimal('gross_salary', 15, 2)->default(0);
            $table->decimal('taxable_income', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0); // PAYE
            $table->decimal('total_deductions', 15, 2)->default(0);
            $table->decimal('net_pay', 15, 2)->default(0);
            
            $table->boolean('is_paid')->default(false);
            $table->timestamps();

            // Prevent duplicate slips for same employee in same period
            $table->unique(['payroll_period_id', 'employee_id']);
        });

        // 5. Payslip Items (The line items)
        Schema::create('pay_slip_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pay_slip_id')->constrained('pay_slips')->onDelete('cascade');
            
            $table->string('name'); // e.g. "Housing Allowance", "NHIF", "Loan: ADV-001"
            $table->enum('type', ['Earning', 'Deduction', 'Tax']);
            $table->decimal('amount', 15, 2);
            $table->boolean('is_taxable')->default(false);
            
            // Optional: link back to source loan if this is a loan deduction
            $table->foreignId('loan_id')->nullable()->constrained('pay_employee_loans');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pay_slip_items');
        Schema::dropIfExists('pay_slips');
        Schema::dropIfExists('pay_payroll_periods');
        Schema::dropIfExists('hrm_attendance');
        Schema::dropIfExists('pay_employee_loans');
    }
};