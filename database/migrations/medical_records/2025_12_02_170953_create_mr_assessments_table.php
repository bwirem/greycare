<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_assessments', function (Blueprint $table) {
            $table->id();

            // Link to Booking
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete();

            $table->text('systematicexamination')->nullable();
            $table->boolean('newcomplain')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_assessments');
    }
};