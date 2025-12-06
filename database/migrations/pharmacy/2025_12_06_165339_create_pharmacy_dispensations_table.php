<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_dispensations', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('pharmacy_prescription_id')->constrained('pharmacy_prescriptions')->restrictOnDelete();
            
            // Quantity Given (Might differ from prescribed if partial dose)
            $table->double('quantity_issued', 16, 2)->default(0);
            
            // Batch Info
            $table->string('batch_no', 50)->nullable();
            $table->date('expiry_date')->nullable();

            $table->foreignId('pharmacist_user_id')->constrained('users');
            $table->timestamp('dispensed_at')->useCurrent();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacy_dispensations');
    }
};