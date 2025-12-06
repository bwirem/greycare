<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rad_procedures', function (Blueprint $table) {
            $table->id();
            
            $table->string('name'); // e.g., "Chest X-Ray PA View"
            $table->string('code', 50)->nullable()->index(); // CPT Code or Internal Code

            // Link to Modality (e.g., This procedure belongs to X-Ray)
            $table->foreignId('rad_modality_id')->constrained('rad_modalities')->restrictOnDelete();

            // *** BILLING LINK ***
            // Links to Inventory/Service setup for pricing
            $table->unsignedBigInteger('bill_item_id')->nullable()->index();

            // Clinical Details
            $table->string('body_part', 100)->nullable(); // e.g., "Chest", "Head"
            $table->boolean('contrast_required')->default(false);
            
            // Standard Duration (for scheduling)
            $table->integer('duration_minutes')->default(15);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rad_procedures');
    }
};