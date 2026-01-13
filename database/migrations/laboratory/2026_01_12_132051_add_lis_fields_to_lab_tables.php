<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add 'machine_code' to Parameters
        // We wrap this in a try-catch to ignore "Duplicate column" errors if you run it twice
        try {
            Schema::table('lab_test_parameters', function (Blueprint $table) {
                $table->string('machine_code', 50)->nullable()->index()->after('code');
            });
        } catch (\Exception $e) {
            // Ignore if column already exists
        }

        // 2. Add Machine Flags to Results
        try {
            Schema::table('lab_results', function (Blueprint $table) {
                $table->string('machine_flag', 20)->nullable()->after('result_value');
                $table->string('machine_raw_value', 255)->nullable()->after('machine_flag');
            });
        } catch (\Exception $e) {
            // Ignore if columns already exist
        }
    }

    public function down(): void
    {
        // We use try-catch here too to avoid the 'generation_expression' error on rollback
        try {
            Schema::table('lab_test_parameters', function (Blueprint $table) {
                $table->dropColumn('machine_code');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('lab_results', function (Blueprint $table) {
                $table->dropColumn(['machine_flag', 'machine_raw_value']);
            });
        } catch (\Exception $e) {}
    }
};