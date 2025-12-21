<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void {
        Schema::create('rch_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pregnancy_id')->constrained('rch_anc_pregnancies');
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions'); // Admitted for delivery
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings');     // Or emergency

            $table->dateTime('delivery_datetime');
            $table->string('mode_of_delivery'); // SVD, C-Section
            $table->enum('outcome', ['Live Birth', 'Fresh Still Birth', 'Macerated Still Birth']);
            
            $table->text('complications')->nullable();
            $table->decimal('blood_loss_ml', 6, 2)->nullable();
            
            // Baby Snapshot
            $table->string('child_gender', 10);
            $table->decimal('birth_weight_kg', 4, 2);
            $table->integer('apgar_score_1min')->nullable();
            $table->integer('apgar_score_5min')->nullable();

            $table->foreignId('conducted_by')->constrained('users');
            $table->timestamps();
        });
        
        Schema::create('rch_pnc_visits', function (Blueprint $table) {
            $table->id();
            $table->string('patient_code', 50);
            $table->foreign('patient_code')->references('code')->on('patients');
            $table->foreignId('opd_booking_id')->constrained('opd_bookings'); // Visit Link
            $table->foreignId('delivery_id')->nullable()->constrained('rch_deliveries');

            $table->string('timing', 20); // 48hrs, 7days
            $table->string('uterus_involution')->nullable();
            $table->string('lochia_status')->nullable();
            $table->string('c_section_wound')->nullable();
            $table->boolean('vitamin_a_given')->default(false);
            
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('rch_pnc_visits');
        Schema::dropIfExists('rch_deliveries');
    }
};