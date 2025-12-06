<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_issue_requests', function (Blueprint $table) {
            $table->id();
            
            // Request Context
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings');
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions');
            $table->string('patientcode', 50)->nullable();
            
            // What is needed?
            $table->string('blood_group_required', 10);
            $table->foreignId('bb_component_type_id')->constrained('bb_component_types');
            $table->integer('units_required')->default(1);
            
            // Urgency
            $table->string('urgency', 20)->default('Routine'); // Routine, Emergency
            
            // Crossmatch Status
            $table->string('status', 50)->default('Requested'); // Requested, Crossmatched, Issued
            
            // The Bag Issued (If single unit issued per request row)
            $table->foreignId('issued_bag_id')->nullable()->constrained('bb_blood_bags');
            
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('issued_by')->nullable()->constrained('users');
            $table->dateTime('issued_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_issue_requests');
    }
};