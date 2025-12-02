<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_assessment_complains', function (Blueprint $table) {
            $table->id();
            
            // Link to Booking
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete();

            // Optional: Link to the specific assessment parent above
            $table->foreignId('mr_assessment_id')->nullable()->constrained('mr_assessments')->nullOnDelete();
                       
            $table->string('srno', 255)->default('0');
            $table->text('cheifcomplain')->nullable();
            $table->text('duration')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_assessment_complains');
    }
};