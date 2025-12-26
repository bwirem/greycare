<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facilityoptions', function (Blueprint $table) {
            // This column will hold the ID of the default Cash/Bank account for this facility.
            $table->foreignId('chart_of_account_id')
            ->nullable()
            ->after('logo_path')
            ->constrained('chart_of_accounts')->onDelete('set null');
            $table->foreignId('default_cash_billing_group_id')
            ->after('chart_of_account_id')
            ->nullable()
            ->constrained('patient_billing_groups')
            ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('facilityoptions', function (Blueprint $table) {
            $table->dropForeign(['chart_of_account_id']);
            $table->dropColumn('chart_of_account_id');
            $table->dropForeign(['default_cash_billing_group_id']);
            $table->dropColumn('default_cash_billing_group_id');
        });
    }
};