<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add 'machine_code' to Parameters (e.g., to store "WBC", "PLT")
        if (Schema::hasTable('lab_test_parameters') && !Schema::hasColumn('lab_test_parameters', 'machine_code')) {
            Schema::table('lab_test_parameters', function (Blueprint $table) {
                $table->string('machine_code', 50)->nullable()->index()->after('code');
            });
        }

        // 2. Add Machine Flags to Results (e.g., to store "H", "L")
        if (Schema::hasTable('lab_results') && !Schema::hasColumn('lab_results', 'machine_flag')) {
            Schema::table('lab_results', function (Blueprint $table) {
                $table->string('machine_flag', 20)->nullable()->after('result_value');
                $table->string('machine_raw_value', 255)->nullable()->after('machine_flag');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('lab_test_parameters', 'machine_code')) {
            Schema::table('lab_test_parameters', function (Blueprint $table) {
                $table->dropColumn('machine_code');
            });
        }

        if (Schema::hasColumn('lab_results', 'machine_flag')) {
            Schema::table('lab_results', function (Blueprint $table) {
                $table->dropColumn(['machine_flag', 'machine_raw_value']);
            });
        }
    }
};