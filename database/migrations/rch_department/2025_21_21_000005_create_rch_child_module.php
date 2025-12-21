<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void {
        // 1. Growth/Development (Weight comes from mr_vital_signs)
        Schema::create('rch_child_assessments', function (Blueprint $table) {
            $table->id();
            $table->string('patient_code', 50);
            $table->foreign('patient_code')->references('code')->on('patients');
            $table->foreignId('opd_booking_id')->constrained('opd_bookings');

            $table->integer('age_months');
            
            // Interpretation of Vitals (Card Colors)
            $table->enum('weight_for_age_status', ['Green', 'Grey', 'Red']);
            $table->enum('height_for_age_status', ['Green', 'Grey', 'Red'])->nullable();
            
            $table->string('feeding_practice')->nullable();
            $table->text('development_milestones')->nullable();
            
            $table->boolean('vitamin_a_given')->default(false);
            $table->boolean('deworming_given')->default(false);
            
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // 2. Vaccines
        Schema::create('rch_immunizations', function (Blueprint $table) {
            $table->id();
            $table->string('patient_code', 50);
            $table->foreign('patient_code')->references('code')->on('patients');
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings');
            $table->foreignId('vaccine_id')->constrained('rch_vaccines');

            $table->date('administered_date');
            $table->string('batch_number')->nullable();
            $table->string('remarks')->nullable();

            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('rch_immunizations');
        Schema::dropIfExists('rch_child_assessments');
    }
};