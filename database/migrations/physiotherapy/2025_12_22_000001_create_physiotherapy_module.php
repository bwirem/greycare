<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Master Data: Types of Treatments
        // Replaces columns like 'electrimusclestimulation', 'shortwave', etc.
        Schema::create('phy_treatment_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Ultrasound", "Massage"
            $table->string('code', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed Default Data based on your legacy table
        DB::table('phy_treatment_types')->insert([
            ['name' => 'Electric Muscle Stimulation (EMS)', 'code' => 'EMS'],
            ['name' => 'Short Wave Diathermy', 'code' => 'SWD'],
            ['name' => 'Infrared Heater', 'code' => 'IR'],
            ['name' => 'Ultrasound Therapy', 'code' => 'UST'],
            ['name' => 'Therapeutic Exercises', 'code' => 'EXS'],
            ['name' => 'Ice/Cold Therapy', 'code' => 'ICE'],
            ['name' => 'Warm Bath / Hydrotherapy', 'code' => 'HYD'],
            ['name' => 'Massage / Manual Therapy', 'code' => 'MSG'],
        ]);

        // 2. The Session Header (The Visit)
        Schema::create('phy_sessions', function (Blueprint $table) {
            $table->id();
            
            // Link to Patient
            $table->string('patient_code', 50);
            $table->foreign('patient_code')->references('code')->on('patients')->cascadeOnDelete();

            // Link to Hospital Visit (The Hub)
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete();

            // Clinical Notes
            $table->text('aims_of_therapy')->nullable(); // Legacy: aimsofthetherapy
            $table->text('therapist_feedback')->nullable(); // Legacy: feedbackfromthetherapist
            
            // Timing
            $table->dateTime('session_start'); // Legacy: transdate
            $table->dateTime('session_end')->nullable(); // Legacy: timeout
            
            // Authorization (Insurance) - usually pulled from Booking, but can store here if specific
            $table->string('authorization_number')->nullable();

            // Audit
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // 3. The Treatments Performed in that Session
        Schema::create('phy_session_items', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('phy_session_id')->constrained('phy_sessions')->cascadeOnDelete();
            $table->foreignId('treatment_type_id')->constrained('phy_treatment_types');
            
            // Specific details (e.g., "Left Shoulder, 15 mins")
            $table->string('body_part')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phy_session_items');
        Schema::dropIfExists('phy_sessions');
        Schema::dropIfExists('phy_treatment_types');
    }
};