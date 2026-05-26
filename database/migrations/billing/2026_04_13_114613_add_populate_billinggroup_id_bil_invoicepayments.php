<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add column
        Schema::table('bil_invoicepayments', function (Blueprint $table) {
            $table->unsignedBigInteger('billinggroup_id')->nullable()->after('customer_id');

            $table->foreign('billinggroup_id')
                ->references('id')
                ->on('patient_billing_groups')
                ->nullOnDelete();
        });

        // 2. Populate with DATE-AWARE logic
        DB::statement("
            UPDATE bil_invoicepayments bs
            JOIN bls_customers bc ON bc.id = bs.customer_id

            SET bs.billinggroup_id = COALESCE(

                -- 1. OPD: closest booking BEFORE or ON sale date
                (
                    SELECT ob.billinggroup_id
                    FROM opd_bookings ob
                    WHERE ob.patientcode = bc.patient_code
                      AND ob.billinggroup_id IS NOT NULL
                      AND ob.bookdate <= bs.transdate
                    ORDER BY ob.bookdate DESC
                    LIMIT 1
                ),

                -- 2. IPD: closest admission BEFORE or ON sale date
                (
                    SELECT ia.billinggroup_id
                    FROM ipd_admissions ia
                    WHERE ia.patientcode = bc.patient_code
                      AND ia.billinggroup_id IS NOT NULL
                      AND ia.admission_date <= bs.transdate
                    ORDER BY ia.admission_date DESC
                    LIMIT 1
                ),

                -- 3. Fallback: latest IPD admission (any date)
                (
                    SELECT ia.billinggroup_id
                    FROM ipd_admissions ia
                    WHERE ia.patientcode = bc.patient_code
                      AND ia.billinggroup_id IS NOT NULL
                    ORDER BY ia.admission_date DESC
                    LIMIT 1
                )

            )
        ");
    }

    public function down(): void
    {
        Schema::table('bil_invoicepayments', function (Blueprint $table) {
            $table->dropForeign(['billinggroup_id']);
            $table->dropColumn('billinggroup_id');
        });
    }
};