<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theatre_post_op_discharges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('theatre_booking_id')->constrained('theatre_bookings')->cascadeOnDelete();

            $table->string('condition', 100)->nullable(); // Stable, Critical
            $table->string('discharge_to', 100)->nullable(); // Ward, ICU, Home

            // Vitals on Discharge
            $table->string('bp', 20)->nullable();
            $table->integer('heart_rate')->default(0);
            $table->integer('resp_rate')->default(0);
            $table->decimal('temperature', 5, 2)->default(0);
            $table->integer('spo2')->default(0);

            $table->foreignId('nurse_user_id')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theatre_post_op_discharges');
    }
};