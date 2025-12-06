<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_crossmatches', function (Blueprint $table) {
            $table->id();

            // Link to the Doctor's Request
            $table->foreignId('bb_issue_request_id')->constrained('bb_issue_requests')->cascadeOnDelete();
            
            // Link to the specific Bag in stock
            $table->foreignId('bb_blood_bag_id')->constrained('bb_blood_bags');
            
            // Patient details (Redundant but safe for crossmatch history)
            $table->string('patientcode', 50);
            
            // Results
            $table->string('compatibility_result', 20); // Compatible, Incompatible
            $table->foreignId('performed_by')->constrained('users');
            $table->timestamp('performed_at')->useCurrent();
            
            // Reservation logic
            $table->dateTime('reserved_until')->nullable(); // Bag is held until this time
            $table->string('status', 20)->default('Reserved'); // Reserved, Issued, Released (Back to stock)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_crossmatches');
    }
};