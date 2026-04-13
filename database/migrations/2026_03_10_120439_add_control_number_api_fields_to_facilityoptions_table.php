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
        Schema::table('facilityoptions', function (Blueprint $table) {
            // Adding Control Number API configuration fields
            $table->string('corporate_id')->nullable()->after('show_register_button');
            $table->string('token_id')->nullable()->after('corporate_id');
            $table->text('access_token')->nullable()->after('token_id'); // Text in case the token is long
            $table->string('registration_url')->nullable()->after('access_token');
            $table->string('check_payment_url')->nullable()->after('registration_url');
            $table->string('crdb_payment_type')->default('1088')->nullable()->after('check_payment_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facilityoptions', function (Blueprint $table) {
            $table->dropColumn([
                'corporate_id',
                'token_id',
                'access_token',
                'registration_url',
                'check_payment_url',
                'crdb_payment_type'
            ]);
        });
    }
};