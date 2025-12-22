
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
        Schema::table('bil_orderitems', function (Blueprint $table) {
            $table->string('source_type', 50)->nullable()->index(); // 'laboratory', 'pharmacy'
            $table->unsignedBigInteger('source_id')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bil_orderitems', function (Blueprint $table) {
            $table->dropColumn(['source_type', 'source_id']);
        });
    }
};
       