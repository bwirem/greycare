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
        Schema::table('lab_panels', function (Blueprint $table) {            
             $table->unsignedBigInteger('iv_product_id')->nullable()->after('lab_nature_of_sample_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lab_panels', function (Blueprint $table) {
            $table->dropColumn('iv_product_id');
        });
    }
};