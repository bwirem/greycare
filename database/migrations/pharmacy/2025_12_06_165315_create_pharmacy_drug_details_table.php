<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_drug_details', function (Blueprint $table) {
            $table->id();
            
            // *** THE LINK ***
            // This connects the clinical data to your existing inventory item
            $table->foreignId('product_id')->unique()->constrained('siv_products')->cascadeOnDelete();
            
            // Clinical Info
            $table->string('generic_name', 255)->nullable();
            
            // --- DOSAGE CALCULATION FIELDS (Based on your C# Logic) ---
            
            // mState: 0 = Solid (Tablet/Capsule), 1 = Liquid (Syrup/Suspension)
            $table->integer('formulation_type')->default(0); 
            
            // mStrength: e.g., 500 (mg)
            $table->double('strength_amount', 16, 2)->default(0);
            $table->string('strength_unit', 20)->default('mg'); 
            
            // mTotalVolume: e.g., 100 (ml) per bottle. Used for liquid calc.
            $table->double('total_volume', 16, 2)->default(0); 
            $table->string('volume_unit', 20)->default('ml');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacy_drug_details');
    }
};