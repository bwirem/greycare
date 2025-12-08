<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_assessments', function (Blueprint $table) {
            $table->id();
            
            // Link to Ward Round (Correct)
            $table->foreignId('ipd_ward_round_id')->constrained('ipd_ward_rounds')->cascadeOnDelete();
            
            $table->text('systematic_examination')->nullable();
            $table->boolean('has_new_complaint')->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_assessments');
    }
};