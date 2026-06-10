<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orpadoptativeorphanages', function (Blueprint $table) {
            $table->id('autocode');
            $table->dateTime('sysdate')->nullable();
            $table->dateTime('transdate')->nullable();
            
            $table->string('childcode', 50)->nullable()->default('');
            $table->string('orphanagename', 50)->nullable()->default('');
            $table->string('personincharge', 50)->nullable()->default('');
            $table->string('position', 50)->nullable()->default('');
            $table->string('institution', 50)->nullable()->default('');
            $table->string('contact', 50)->nullable()->default('');
            
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orpadoptativeorphanages');
    }
};