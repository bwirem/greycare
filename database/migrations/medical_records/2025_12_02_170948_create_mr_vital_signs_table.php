<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_vital_signs', function (Blueprint $table) {
            $table->id();

            // Link to Booking
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete();

            $table->string('patientcode', 50)->nullable()->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->restrictOnDelete();

            $table->dateTime('vitaldatetime')->nullable()->index();
           
            // Vitals Data
            $table->double('height', 16, 2)->default(0.00);
            $table->double('weight', 16, 2)->default(0.00);
            $table->double('temperature', 16, 2)->default(0.00);
            $table->double('pulse', 16, 2)->default(0.00);
            $table->double('respirationrate', 16, 2)->default(0.00);
            $table->string('bloodpressure', 50)->nullable();
            $table->double('bmi', 16, 4)->default(0.0000); 
            $table->double('muac', 16, 2)->default(0.00);
            $table->double('oxygensaturation', 16, 2)->default(0.00);
            $table->double('heartrate', 16, 2)->default(0.00);

            $table->string('authorizationno', 50)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_vital_signs');
    }
};