<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theatre_post_op_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('theatre_booking_id')->constrained('theatre_bookings')->cascadeOnDelete();

            // Interventions
            $table->boolean('extubated')->default(false);
            $table->boolean('oxygen_therapy')->default(false); // Mask/Cannula
            
            // Medications
            $table->text('analgesia')->nullable();
            $table->text('other_meds')->nullable();
            $table->text('iv_fluids')->nullable();
            $table->text('blood_products')->nullable();

            $table->foreignId('nurse_user_id')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theatre_post_op_treatments');
    }
};