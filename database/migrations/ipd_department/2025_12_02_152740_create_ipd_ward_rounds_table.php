<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ipd_ward_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ipd_admission_id')->constrained('ipd_admissions')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->comment('Doctor performing round');
            $table->string('patientcode', 50)->index();
            $table->timestamp('round_date')->useCurrent();
            $table->text('clinical_notes')->nullable()->comment('Progress in ward');
            $table->text('treatment_plan')->nullable();
            $table->string('general_condition', 255)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('ipd_ward_rounds'); }
};