<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void {
        Schema::create('rch_fp_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique(); 
            $table->string('name'); 
            $table->string('type'); // Hormonal, Barrier, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('rch_vaccines', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->integer('target_age_weeks')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('rch_vaccines');
        Schema::dropIfExists('rch_fp_methods');
    }
};