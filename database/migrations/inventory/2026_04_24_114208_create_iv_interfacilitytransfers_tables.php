<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create the main Inter-Facility Transfer table
        Schema::create('iv_interfacilitytransfers', function (Blueprint $table) {
            $table->id();
            $table->date('transdate');
            $table->timestamp('sysdate')->useCurrent();           
            $table->foreignId('source_store_id')->constrained('siv_stores')->onDelete('cascade'); 
            $table->foreignId('destination_facility_id')->constrained('facilities')->onDelete('cascade');       
            $table->integer('stage')->default(1); 
            $table->index('stage'); 
            $table->integer('restore_stage')->default(1); 
            $table->decimal('total', 15, 2)->default(0); 
            $table->text('remarks')->nullable(); // Added for transfer remarks
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 2. Create the Items table for Inter-Facility Transfers
        Schema::create('iv_interfacilitytransferitems', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inter_facility_transfer_id')->constrained('iv_interfacilitytransfers')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('siv_products')->onDelete('cascade');
            $table->decimal('quantity', 10, 2);
            $table->decimal('price', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iv_interfacilitytransferitems');
        Schema::dropIfExists('iv_interfacilitytransfers');
    }
};