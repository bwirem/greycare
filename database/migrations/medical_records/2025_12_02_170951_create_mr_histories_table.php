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
            
            // Link to Booking
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete();
                        
            $table->text('historypresentingillness')->nullable();
            $table->text('reviewofothersystems')->nullable();
            $table->text('pastmedicalhistory')->nullable();
            $table->text('socialandfamilyhistory')->nullable();           
           

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_histories');
    }
};