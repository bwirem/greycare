<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mortuaries (Root Level - Just a grouping/building)
        Schema::create('mortuaries', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('type')->nullable(); // e.g., Main Building, Annex
            $table->timestamps();
        });

        // 2. Mortuary Rooms (Handles Billing/Pricing)
        Schema::create('mortuary_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mortuary_id')->constrained('mortuaries')->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
        });

        // 3. Add mortuary_room_id to bls_items for Billing sync
        Schema::table('bls_items', function (Blueprint $table) {
            $table->foreignId('mortuary_room_id')->nullable()->constrained('mortuary_rooms')->onDelete('cascade');
        });

        // 4. Mortuary Cabinets / Trays (Belongs to Room)
        Schema::create('mortuary_cabinets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mortuary_room_id')->constrained('mortuary_rooms')->onDelete('cascade');
            $table->string('name'); // e.g., Tray 1, Cabinet A
            $table->enum('status', ['Free', 'Occupied', 'Maintenance'])->default('Free');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mortuary_cabinets');
        Schema::table('bls_items', function (Blueprint $table) {
            $table->dropForeign(['mortuary_room_id']);
            $table->dropColumn('mortuary_room_id');
        });
        Schema::dropIfExists('mortuary_rooms');
        Schema::dropIfExists('mortuaries');
    }
};