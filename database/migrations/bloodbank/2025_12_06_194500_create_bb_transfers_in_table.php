<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_transfers_in', function (Blueprint $table) {
            $table->id();
            
            // Source details
            $table->string('source_facility_name'); // e.g., "National Blood Transfusion Service"
            $table->string('transfer_reference_no')->nullable(); // Their Delivery Note #
            $table->date('transfer_date');
            
            // Quality Control on Arrival
            $table->double('temperature_on_arrival', 5, 2)->nullable(); // Cold chain verification
            $table->string('delivered_by')->nullable();
            
            $table->foreignId('received_by')->constrained('users'); // Staff ID
            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_transfers_in');
    }
};