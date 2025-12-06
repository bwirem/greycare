<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_transfer_in_items', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('bb_transfer_in_id')->constrained('bb_transfers_in')->cascadeOnDelete();
            
            // Bag Details
            $table->string('bag_serial_number', 50); // The unique barcode
            $table->foreignId('bb_component_type_id')->constrained('bb_component_types'); // e.g., Whole Blood
            $table->string('blood_group', 10); // A+, B-, etc.
            
            // Dates are critical for external blood
            $table->date('collection_date');
            $table->date('expiry_date');
            
            $table->double('volume', 8, 2)->default(450); // ml

            // Verification
            $table->boolean('passed_quality_check')->default(true);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_transfer_in_items');
    }
};