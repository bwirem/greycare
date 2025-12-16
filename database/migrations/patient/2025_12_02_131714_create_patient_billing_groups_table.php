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
        Schema::create('patient_billing_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');  
            // Configuration Flags (INT 11)
            $table->integer('hasid')->default(0);
            $table->integer('hasceiling')->default(0);
            
            // "ceilingamount" DOUBLE(11,2)
            $table->double('ceilingamount', 11, 2)->default(0.00);

            // "pricecategory" VARCHAR(50)
            $table->string('pricecategory', 50)->nullable();

            // More Configuration Flags
            $table->integer('hassubgroups')->default(0);

            // Status Flags
            $table->integer('isdefault')->default(0);
            $table->integer('isinsurance')->default(0);
            $table->integer('isexemption')->default(0);
            $table->integer('inactive')->default(0);

            // API Configuration
            $table->string('url', 255)->nullable(); // API Base URL
            $table->string('username', 100)->nullable();
            $table->string('password', 100)->nullable();    
          
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_billing_groups');
    }
};
