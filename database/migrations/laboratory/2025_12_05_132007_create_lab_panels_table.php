<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_panels', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('code', 50)->nullable()->index();

            // Link to Category (Hematology)
            $table->foreignId('lab_category_id')->nullable()->constrained('lab_categories')->nullOnDelete();
            
            // Default Sample Type required
            $table->foreignId('lab_nature_of_sample_id')->nullable()->constrained('lab_nature_of_samples')->nullOnDelete();
                        
            // Flags
            $table->boolean('is_available')->default(true);
            $table->boolean('for_blood_bank')->default(false);
            
            // Machine Integration (LIS)
            $table->string('ip_address', 50)->nullable(); 
            $table->string('port', 50)->nullable();
            $table->boolean('for_hl7')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_panels');
    }
};