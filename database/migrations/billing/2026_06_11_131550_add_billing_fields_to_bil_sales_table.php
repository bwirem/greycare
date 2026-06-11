<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bil_sales', function (Blueprint $table) {
           
            $table->unsignedBigInteger('billingsubgroup_id')->nullable()->after('billinggroup_id');
            $table->unsignedBigInteger('ward_id')->nullable()->after('billingsubgroup_id');


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
        Schema::table('bil_sales', function (Blueprint $table) {
            
            $table->dropForeign(['billingsubgroup_id']);
            $table->dropForeign(['billinggroupmembershipno']);
            $table->dropForeign(['ward_id']);

            $table->dropColumn([               
                'billingsubgroup_id',
                'billinggroupmembershipno',
                'ward_id'
            ]);
        });
    }
};