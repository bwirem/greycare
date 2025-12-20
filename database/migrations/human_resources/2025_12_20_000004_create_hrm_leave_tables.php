<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Leave Types (e.g. Annual, Sick, Maternity)
        Schema::create('hrm_leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('days_per_year')->default(21);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Leave Requests
        Schema::create('hrm_leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hrm_employees')->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained('hrm_leave_types');
            
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('days_requested')->default(0);
            $table->date('return_date')->nullable();
            
            $table->text('reason')->nullable();
            
            // Workflow
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Cancelled'])->default('Pending');
            $table->text('admin_remarks')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users'); // Assuming standard User table
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hrm_leave_requests');
        Schema::dropIfExists('hrm_leave_types');
    }
};