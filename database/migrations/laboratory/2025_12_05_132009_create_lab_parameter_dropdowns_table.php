<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_parameter_dropdowns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_test_parameter_id')->constrained('lab_test_parameters')->cascadeOnDelete();
            $table->string('value', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_parameter_dropdowns');
    }
};