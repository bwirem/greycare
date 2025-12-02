<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_transfer_logs', function (Blueprint $table) {
            $table->id();

            // Link to Admission Log (Using ID)
            $table->foreignId('ipd_admission_log_id')
                  ->nullable()
                  ->constrained('ipd_admission_logs')
                  ->restrictOnDelete();            
            

            $table->dateTime('SYSDATE')->nullable();
            $table->dateTime('transferdate')->nullable();

            // ---------------------------------------------------------
            // LINK TO OPD BOOKING (Updated)
            // ---------------------------------------------------------
            $table->foreignId('opd_booking_id')
                  ->nullable()
                  ->constrained('opd_bookings')
                  ->restrictOnDelete();

            $table->string('patientcode', 50)->nullable()->index();

            // Location FROM
            $table->foreignId('from_ward_id')->nullable()->constrained('ipd_wards')->restrictOnDelete();
            $table->foreignId('from_room_id')->nullable()->constrained('ipd_rooms')->restrictOnDelete();
            $table->foreignId('from_bed_id')->nullable()->constrained('ipd_beds')->restrictOnDelete();
            
            // Location TO
            $table->foreignId('to_ward_id')->nullable()->constrained('ipd_wards')->restrictOnDelete();
            $table->foreignId('to_room_id')->nullable()->constrained('ipd_rooms')->restrictOnDelete();
            $table->foreignId('to_bed_id')->nullable()->constrained('ipd_beds')->restrictOnDelete();

            $table->string('transfertofacility', 255)->nullable();
            $table->string('patientcondition', 255)->nullable();
            $table->string('registrystatus', 50)->nullable();            
           
            $table->foreignId('user_id')->nullable()->constrained('users')->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_transfer_logs');
    }
};