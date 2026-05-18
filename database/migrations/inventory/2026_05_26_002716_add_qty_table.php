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
        // 1. Update iv_producttransactions
        Schema::table('iv_producttransactions', function (Blueprint $table) {
            $previousColumn = 'qtyout_20';

            for ($i = 21; $i <= 60; $i++) {
                $table->decimal("qtyin_{$i}", 15, 2)->default(0)->after($previousColumn);
                $previousColumn = "qtyin_{$i}";

                $table->decimal("qtyout_{$i}", 15, 2)->default(0)->after($previousColumn);
                $previousColumn = "qtyout_{$i}";
            }
        });

        // 2. Update iv_physicalstockbalances
        Schema::table('iv_physicalstockbalances', function (Blueprint $table) {
            $previousColumn = 'qty_20';

            for ($i = 21; $i <= 60; $i++) {
                $table->decimal("qty_{$i}", 15, 2)->default(0)->after($previousColumn);
                $previousColumn = "qty_{$i}";
            }
        });

        // 3. Update iv_productcontrol
        Schema::table('iv_productcontrol', function (Blueprint $table) {
            $previousColumn = 'qty_20';

            for ($i = 21; $i <= 60; $i++) {
                $table->decimal("qty_{$i}", 15, 2)->default(0)->after($previousColumn);
                $previousColumn = "qty_{$i}";
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Revert iv_producttransactions
        Schema::table('iv_producttransactions', function (Blueprint $table) {
            $columnsToDrop = [];
            for ($i = 21; $i <= 60; $i++) {
                $columnsToDrop[] = "qtyin_{$i}";
                $columnsToDrop[] = "qtyout_{$i}";
            }
            $table->dropColumn($columnsToDrop);
        });

        // 2. Revert iv_physicalstockbalances
        Schema::table('iv_physicalstockbalances', function (Blueprint $table) {
            $columnsToDrop = [];
            for ($i = 21; $i <= 60; $i++) {
                $columnsToDrop[] = "qty_{$i}";
            }
            $table->dropColumn($columnsToDrop);
        });

        // 3. Revert iv_productcontrol
        Schema::table('iv_productcontrol', function (Blueprint $table) {
            $columnsToDrop = [];
            for ($i = 21; $i <= 60; $i++) {
                $columnsToDrop[] = "qty_{$i}";
            }
            $table->dropColumn($columnsToDrop);
        });
    }
};