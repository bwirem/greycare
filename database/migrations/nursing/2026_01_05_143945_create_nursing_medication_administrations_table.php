<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('nursing_medication_administrations', function (Blueprint $table) {
            $table->id();
            
            // 1. Define the column first
            $table->unsignedBigInteger('pharmacy_prescription_id');

            // // 2. Define the Foreign Key with a CUSTOM SHORT NAME ('nma_rx_fk')
            // // This bypasses the 64-character limit
            // $table->foreign('pharmacy_prescription_id', 'nma_rx_fk') 
            //       ->references('id')
            //       ->on('pharmacy_prescriptions')
            //       ->cascadeOnDelete();            

            // Define the Foreign Key without a custom name
            $table->foreign('pharmacy_prescription_id') 
                  ->references('id')
                  ->on('pharmacy_prescriptions')
                  ->onDelete('cascade');
            
            // Other Foreign Keys (These names fit within the limit, so standard syntax is fine)
            $table->foreignId('opd_booking_id')->nullable()->constrained('opd_bookings');
            $table->foreignId('ipd_admission_id')->nullable()->constrained('ipd_admissions');
            $table->foreignId('nurse_user_id')->constrained('users');
            
            // Data fields
            $table->dateTime('administered_at');
            $table->string('status')->default('Given'); 
            $table->string('remarks')->nullable(); 
            $table->double('quantity', 8, 2)->default(1);
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('nursing_medication_administrations');
    }
};