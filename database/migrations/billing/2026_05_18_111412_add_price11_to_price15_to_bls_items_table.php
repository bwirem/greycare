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
        Schema::table('bls_items', function (Blueprint $table) {

            $table->decimal('price11', 10, 2)->default(0)->after('price10');
            $table->decimal('price12', 10, 2)->default(0)->after('price11');
            $table->decimal('price13', 10, 2)->default(0)->after('price12');
            $table->decimal('price14', 10, 2)->default(0)->after('price13');
            $table->decimal('price15', 10, 2)->default(0)->after('price14');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bls_items', function (Blueprint $table) {

            $table->dropColumn([
                'price11',
                'price12',
                'price13',
                'price14',
                'price15',
            ]);

        });
    }
};