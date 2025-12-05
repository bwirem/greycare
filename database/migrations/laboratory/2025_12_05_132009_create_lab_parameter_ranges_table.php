<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_parameter_ranges', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('lab_test_parameter_id')->constrained('lab_test_parameters')->cascadeOnDelete();

            // Age logic (Days)
            $table->integer('age_min_days')->default(0); 
            $table->integer('age_max_days')->default(36500); 

            // Normal Ranges
            $table->double('male_min', 16, 2)->default(0);
            $table->double('male_max', 16, 2)->default(0);
            $table->double('female_min', 16, 2)->default(0);
            $table->double('female_max', 16, 2)->default(0);

            // Critical Ranges (Panic values)
            $table->double('critical_low', 16, 2)->default(0);
            $table->double('critical_high', 16, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_parameter_ranges');
    }
};