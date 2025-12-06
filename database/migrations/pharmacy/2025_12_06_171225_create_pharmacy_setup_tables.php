<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Frequencies (e.g., OD, BID, TID)
        Schema::create('pharmacy_frequencies', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "BID - 12 Hourly"
            $table->string('code', 20)->nullable(); // e.g., "BID"
            $table->double('value', 8, 2)->default(1); // Multiplier: 2.00
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Standard Durations (e.g., 5/7, 1/52)
        Schema::create('pharmacy_durations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "5 Days"
            $table->string('code', 20)->nullable(); // e.g., "5/7"
            $table->integer('days')->default(1); // Calculation value: 5
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Routes (e.g., Oral, IV, IM)
        Schema::create('pharmacy_routes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Oral
            $table->string('abbreviation', 20)->nullable(); // e.g., PO
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacy_routes');
        Schema::dropIfExists('pharmacy_durations');
        Schema::dropIfExists('pharmacy_frequencies');
    }
};