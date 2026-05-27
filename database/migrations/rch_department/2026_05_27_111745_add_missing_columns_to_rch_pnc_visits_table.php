<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rch_pnc_visits', function (Blueprint $table) {
            $table->date('visit_date')->after('delivery_id')->nullable();
            $table->text('counseling_given')->after('vitamin_a_given')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('rch_pnc_visits', function (Blueprint $table) {
            $table->dropColumn(['visit_date', 'counseling_given']);
        });
    }
};