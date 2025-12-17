<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bls_nhif_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_group_id')->constrained('patient_billing_groups')->cascadeOnDelete();
            
            // NHIF Fields
            $table->string('item_code', 50)->index(); // ItemCode
            $table->string('item_name', 255);         // ItemName
            $table->integer('package_id');            // PackageID
            $table->integer('scheme_id')->nullable(); // SchemeID (for excluded/specific)
            $table->decimal('unit_price', 18, 2);     // UnitPrice
            $table->boolean('is_restricted')->default(false); // IsRestricted
            
            // Excluded Logic
            $table->text('excluded_products')->nullable(); // ExcludedForProducts

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bls_nhif_packages');
    }
};