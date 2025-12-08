<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_assessment_complains', function (Blueprint $table) {
            $table->id();
            
            // Link to PARENT Assessment (Normalization Fix)
            $table->foreignId('mr_assessment_id')->constrained('mr_assessments')->cascadeOnDelete();
                       
            // Standardized Columns
            $table->integer('sort_order')->default(0); // Replaces 'srno'
            $table->text('chief_complaint')->nullable(); // Fixed spelling
            $table->text('duration')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_assessment_complains');
    }
};