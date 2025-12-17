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
        Schema::table('users', function (Blueprint $table) {
            $table->string('pricecategory_id')->nullable();
            $table->foreignId('paymenttype_id')->nullable()->constrained('bls_paymenttypes')->onDelete('set null'); 
               $table->foreignId('store_id')->nullable()->constrained('siv_stores')->onDelete('set null');     
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pricecategory_id');
            $table->dropForeign(['paymenttype_id']);
            $table->dropColumn('paymenttype_id');
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });
    }
};
