<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_examinations', function (Blueprint $table) {
            $table->id();

            // Link to Booking
            $table->foreignId('opd_booking_id')->constrained('opd_bookings')->restrictOnDelete();
            
            // General Exam
            $table->string('glascowcomascore', 255)->nullable();
            $table->string('generalcondition', 255)->nullable();
            $table->integer('pallor')->default(0); 
            $table->integer('juandice')->default(0);
            $table->string('oedema', 50)->nullable();
            $table->integer('rash')->default(0);
            $table->integer('nutritionalstatus')->default(0);
            $table->integer('neckstiffness')->default(0);
            $table->integer('oralthrushsores')->default(0);
            $table->integer('fingerclubbing')->default(0);
            
            // Lymph
            $table->string('lymphadenopathy', 50)->nullable();
            $table->string('lymphadenopathyother', 255)->nullable();

            // Systems
            $table->text('otherrelevantfinding')->nullable();
            $table->text('respirationremark')->nullable();
            $table->integer('cardiovascularremark')->default(0);
            $table->string('murmurs', 50)->nullable();
            
            // Detailed System Text
            $table->text('perabdomen')->nullable();
            $table->text('centralnervoussystem')->nullable();
            $table->text('localexamination')->nullable();
            $table->text('heent')->nullable();
            $table->text('cadiovascularsystem')->nullable();
            $table->text('genitourinarysystem')->nullable();
            $table->text('integumentarysystem')->nullable();
            $table->text('rushremark')->nullable();
            $table->text('muscularskeletal')->nullable();           

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_examinations');
    }
};