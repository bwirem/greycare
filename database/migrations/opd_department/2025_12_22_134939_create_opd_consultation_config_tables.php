<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Doctor Specializations (e.g., General, Dental, Cardiology)
        Schema::create('doctor_specializations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // General, ENT, OBS/GYN
            $table->integer('revisit_days')->default(7); // e.g., 7 days for revisit
            $table->timestamps();
        });

        // 2. Charge Rules (The Pricing Matrix)
        Schema::create('consultation_charge_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('specialization_id')->constrained('doctor_specializations')->cascadeOnDelete();
            
            // 'new' (First Visit), 'revisit' (Within X days)
            $table->string('visit_type', 20); 
            
            // The Bill Item (Price) to charge
            $table->foreignId('bill_item_id')->constrained('bls_items')->restrictOnDelete();
            
            $table->unique(['specialization_id', 'visit_type']);
            $table->timestamps();
        });

        // 3. Link Doctor to Specialization
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('specialization_id')->nullable()->constrained('doctor_specializations')->nullOnDelete();
        });

        // 4. Update Booking to store the calculated charge
        Schema::table('opd_bookings', function (Blueprint $table) {
            $table->foreignId('bill_item_id')->nullable()->constrained('bls_items');
            $table->string('visit_classification', 20)->nullable(); // 'New Case', 'Revisit'
        });
    }

    public function down(): void
    {
        Schema::table('opd_bookings', fn($table) => $table->dropColumn(['bill_item_id', 'visit_classification']));
        Schema::table('users', fn($table) => $table->dropForeign(['specialization_id']));
        Schema::table('users', fn($table) => $table->dropColumn('specialization_id'));
        Schema::dropIfExists('consultation_charge_rules');
        Schema::dropIfExists('doctor_specializations');
    }
};