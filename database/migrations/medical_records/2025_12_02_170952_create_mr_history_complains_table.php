<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_history_complains', function (Blueprint $table) {
            $table->id();

            // Link to PARENT History (Normalization Fix)
            $table->foreignId('mr_history_id')->constrained('mr_histories')->cascadeOnDelete();

            // Standardized Columns
            $table->integer('sort_order')->default(0); // Replaces 'srno' string
            $table->text('chief_complaint')->nullable(); // Fixed spelling: cheif -> chief
            $table->text('duration')->nullable();            
          
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_history_complains');
    }
};