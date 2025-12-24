<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. REMOVED: Schema::table('ipd_wards'...) block.
        // We do NOT need bill_item_id on ipd_wards because bls_items now has ipd_ward_id.

        // 2. KEEP: This log table is required for the Daily Cron Job.
        Schema::create('ipd_bed_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ipd_admission_id')->constrained('ipd_admissions')->cascadeOnDelete();
            $table->date('charge_date');
            $table->decimal('amount', 10, 2);
            $table->timestamps();
            
            // Constraints: A patient cannot be charged for the Bed twice on the same date
            $table->unique(['ipd_admission_id', 'charge_date']);
        });
    }

    public function down(): void   
    {
        Schema::dropIfExists('ipd_bed_charges');
    }
};