<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theatre_procedures', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('code', 50)->nullable()->index();

            // Link to Group
            $table->foreignId('theatre_procedure_group_id')->nullable()->constrained('theatre_procedure_groups')->nullOnDelete();

            // *** BILLING LINK ***
            // Links to Inventory/Service setup for pricing
            $table->unsignedBigInteger('bill_item_id')->nullable()->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theatre_procedures');
    }
};