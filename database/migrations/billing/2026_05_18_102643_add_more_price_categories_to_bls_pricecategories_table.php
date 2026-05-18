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
        Schema::table('bls_pricecategories', function (Blueprint $table) {

            // Use Price Flags
            $table->integer('useprice11')->default(0)->after('useprice10');
            $table->integer('useprice12')->default(0)->after('useprice11');
            $table->integer('useprice13')->default(0)->after('useprice12');
            $table->integer('useprice14')->default(0)->after('useprice13');
            $table->integer('useprice15')->default(0)->after('useprice14');

            // Price Labels
            $table->string('price11')->nullable()->after('price10');
            $table->string('price12')->nullable()->after('price11');
            $table->string('price13')->nullable()->after('price12');
            $table->string('price14')->nullable()->after('price13');
            $table->string('price15')->nullable()->after('price14');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bls_pricecategories', function (Blueprint $table) {

            $table->dropColumn([
                'useprice11',
                'useprice12',
                'useprice13',
                'useprice14',
                'useprice15',

                'price11',
                'price12',
                'price13',
                'price14',
                'price15',
            ]);
        });
    }
};