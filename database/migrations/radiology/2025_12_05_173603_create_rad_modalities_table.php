<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rad_modalities', function (Blueprint $table) {
            $table->id();
            
            $table->string('name'); // e.g., "Digital X-Ray", "CT Scan 64 Slice"
            $table->string('code', 50)->nullable(); // e.g., "DX", "CT", "MR", "US" (DICOM Standard Codes)
            
            // --- MACHINE INTERFACING DETAILS (DICOM Configuration) ---
            $table->string('ae_title', 50)->nullable(); // Application Entity Title (Crucial for PACS)
            $table->string('ip_address', 50)->nullable();
            $table->string('port', 10)->nullable();
            
            $table->string('room_identifier', 50)->nullable(); // Physical Location
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rad_modalities');
    }
};