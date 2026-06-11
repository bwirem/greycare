<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bil_orders', function (Blueprint $table) {

            $table->unsignedBigInteger('billinggroup_id')->nullable()->after('customer_id');
            $table->unsignedBigInteger('billingsubgroup_id')->nullable()->after('billinggroup_id');
            $table->unsignedBigInteger('ward_id')->nullable()->after('billingsubgroup_id');

            // Optional foreign keys
            $table->foreign('billinggroup_id')
                ->references('id')
                ->on('patient_billing_groups')
                ->nullOnDelete();

            $table->foreign('billingsubgroup_id')
                ->references('id')
                ->on('patient_billing_subgroups')
                ->nullOnDelete();
            
             $table->string('billinggroupmembershipno', 100)
                ->nullable()
                ->after('billingsubgroup_id');

            $table->foreign('ward_id')
                ->references('id')
                ->on('ipd_wards')
                ->nullOnDelete();
           
        });
    }

    public function down(): void
    {
        Schema::table('bil_orders', function (Blueprint $table) {

            $table->dropForeign(['billinggroup_id']);
            $table->dropForeign(['billingsubgroup_id']);
            $table->dropForeign(['billinggroupmembershipno']);
            $table->dropForeign(['ward_id']);

            $table->dropColumn([
                'billinggroup_id',
                'billingsubgroup_id',
                'billinggroupmembershipno',
                'ward_id'
            ]);
        });
    }
};