<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void {
        // 1. The Pregnancy File
        Schema::create('rch_anc_pregnancies', function (Blueprint $table) {
            $table->id();
            $table->string('patient_code', 50);
            $table->foreign('patient_code')->references('code')->on('patients')->cascadeOnDelete();
            $table->string('anc_number', 50)->nullable();
            $table->integer('gravida');
            $table->integer('parity');
            $table->date('lmp_date');
            $table->date('edd_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. The ANC Visit
        Schema::create('rch_anc_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pregnancy_id')->constrained('rch_anc_pregnancies')->cascadeOnDelete();
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete(); // Link to Billing/Vitals

            $table->integer('gestational_age_weeks');
            
            // ANC Specific Exams
            $table->decimal('fundal_height_cm', 5, 2)->nullable();
            $table->string('fetal_lie', 50)->nullable();
            $table->string('fetal_heart_rate', 20)->nullable();
            
            // TZ RCH Card Indicators
            $table->enum('urine_albumin', ['Neg', '+', '++', '+++'])->nullable();
            $table->enum('syphilis_result', ['NR', 'R'])->nullable();
            $table->enum('hiv_status', ['Known Pos', 'New Pos', 'Neg', 'Refused'])->nullable();
            
            // Medications/PMTCT
            $table->boolean('arv_prophylaxis')->default(false);
            $table->boolean('ipt_malaria')->default(false);
            $table->boolean('tt_vaccine')->default(false);
            $table->boolean('iron_folate')->default(false);
            $table->boolean('deworming')->default(false);

            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('rch_anc_visits');
        Schema::dropIfExists('rch_anc_pregnancies');
    }
};