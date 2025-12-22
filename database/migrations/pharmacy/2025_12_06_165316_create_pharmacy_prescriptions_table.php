<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_prescriptions', function (Blueprint $table) {
            $table->id();

            // Context
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings')->restrictOnDelete();
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions')->restrictOnDelete();
            $table->string('patientcode', 50)->nullable()->index();

            // *** THE ITEM ORDERED ***
            // Link directly to your existing Inventory Product ID
            $table->foreignId('product_id')->constrained('siv_products')->restrictOnDelete();
            
            // --- DOSAGE INSTRUCTIONS ---
            // Stores the inputs used to calculate the quantity
            $table->string('dosage', 50)->nullable(); // e.g., "10", "5"
            
            $table->string('frequency', 50)->nullable(); // e.g., "TID"
            $table->integer('frequency_val')->default(1); // e.g., 3 (times per day)
            
            $table->string('duration', 50)->nullable(); // e.g., "5/7"
            $table->integer('duration_days')->default(1); // e.g., 5
            
            $table->text('instruction')->nullable(); // e.g., "After meals"

            // --- CALCULATED QUANTITY ---
            // This is the result of your C# logic, stored for billing/dispensing
            $table->double('quantity_prescribed', 16, 2)->default(0); 
            
            // Status
            $table->string('status', 50)->default('Prescribed'); // Prescribed, Paid, Dispensed
            
            // "unpaid", "paid", "waived", "insurance"
            $table->string('payment_status', 20)->default('unpaid')->index();
             
            // Who ordered it
            $table->foreignId('doctor_user_id')->constrained('users');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacy_prescriptions');
    }
};