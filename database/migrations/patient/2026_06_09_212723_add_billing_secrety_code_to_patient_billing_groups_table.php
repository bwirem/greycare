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
        Schema::table('patient_billing_groups', function (Blueprint $table) {
            $table->string('secrety_key')->after('facility_code')->nullable();    
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_billing_groups', function (Blueprint $table) {
            $table->dropColumn(['secrety_key']);
        });
    }
};
