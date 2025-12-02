<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Wards
        Schema::create('ipd_wards', function (Blueprint $table) {
            $table->id();
            $table->string('name');           
            $table->timestamps();
        });

        // 2. Rooms (Belong to Wards)
        Schema::create('ipd_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');         
            
            $table->foreignId('ward_id')->constrained('ipd_wards')->restrictOnDelete();
            
            $table->timestamps();
        });

        // 3. Beds (Belong to Rooms)
        Schema::create('ipd_beds', function (Blueprint $table) {
            $table->id();
            $table->string('name');          
            
            $table->foreignId('room_id')->constrained('ipd_rooms')->restrictOnDelete();
            
            // Helpful status flag (Occupied, Cleaning, Free)
            $table->string('status', 50)->default('Free'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_beds');
        Schema::dropIfExists('ipd_rooms');
        Schema::dropIfExists('ipd_wards');
    }
};