<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_histories', function (Blueprint $table) {
            $table->id();     
                   
            // Link to Booking (Correct for OPD)           
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->cascadeOnDelete();
            
            $table->text('history_presenting_illness')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('social_and_family_history')->nullable();
            $table->text('review_of_other_systems')->nullable(); // Fixed typo: othersystems -> other_systems

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_histories');
    }
};