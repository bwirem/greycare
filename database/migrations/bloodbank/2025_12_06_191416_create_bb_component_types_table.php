<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_component_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Whole Blood", "Platelets"
            $table->string('code', 20)->unique(); // e.g. "WB", "PLT"
            
            // Expiry Rules
            $table->integer('shelf_life_days')->default(35);
            
            // Inventory Link (Optional if you sell components)
            $table->unsignedBigInteger('bill_item_id')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_component_types');
    }
};