<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_donations', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('bb_donor_id')->constrained('bb_donors')->restrictOnDelete();
            
            // Donation Batch / Drive Info
            $table->string('donation_batch', 50)->nullable();
            $table->string('donation_type', 50)->default('Voluntary'); // Voluntary, Replacement, Autologous
            
            // Vitals at time of donation
            $table->double('weight', 8, 2)->nullable();
            $table->string('bp', 20)->nullable();
            $table->double('hb_level', 8, 2)->nullable(); // Hemoglobin
            
            // Volume Collected
            $table->double('volume_collected', 8, 2)->default(450); // ml
            
            // Bag Number (Barcode on the physical bag)
            $table->string('bag_serial_number', 50)->unique();

            $table->timestamp('donation_date')->useCurrent();
            $table->foreignId('collected_by')->nullable()->constrained('users');
            
            // Status: Collected, Screened, Discarded, Processed
            $table->string('status', 50)->default('Collected');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_donations');
    }
};