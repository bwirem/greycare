<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Deferral Reasons (Why a donor is rejected)
        Schema::create('bb_deferral_reasons', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Low Hemoglobin"
            $table->string('code', 20)->nullable();
            $table->string('type', 20)->default('Temporary'); // Temporary, Permanent
            $table->integer('deferral_days')->default(0); // 0 = Permanent, or number of days
            $table->timestamps();
        });

        // 2. Donation Types (Voluntary, Replacement)
        Schema::create('bb_donation_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Voluntary"
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_donation_types');
        Schema::dropIfExists('bb_deferral_reasons');
    }
};