<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_test_parameters', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('code', 50)->nullable()->index();

            // Link to the Panel this belongs to
            $table->foreignId('lab_panel_id')->constrained('lab_panels')->cascadeOnDelete();

            // Result Configuration
            $table->string('units', 50)->nullable(); 
            $table->integer('result_type')->default(1); // 1=Numeric, 2=Text, 3=Select
            
            // Ordering on the result PDF
            $table->integer('sort_order')->default(0); 

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_test_parameters');
    }
};