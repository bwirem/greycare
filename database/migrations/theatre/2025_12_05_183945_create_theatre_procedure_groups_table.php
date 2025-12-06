<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theatre_procedure_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // description
            $table->string('code', 50)->nullable()->index();
            
            // Classification flags
            $table->boolean('is_major')->default(false);
            $table->boolean('is_minor')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theatre_procedure_groups');
    }
};