<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dxt_diagnoses_eyes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Legacy 'description'
            $table->string('code')->unique();
            $table->text('notes')->nullable();  
            
            // Link to Groups
            $table->foreignId('dxt_diagnoses_group_id')
                ->nullable()
                ->constrained('dxt_diagnoses_groups')
                ->nullOnDelete();        
                        
            $table->string('maptocode', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dxt_diagnoses_eyes');
    }
};
