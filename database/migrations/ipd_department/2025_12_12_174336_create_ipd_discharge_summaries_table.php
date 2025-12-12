<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_discharge_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ipd_admission_id')->constrained('ipd_admissions')->cascadeOnDelete();
            
            // Clinical Info
            $table->text('final_diagnosis'); // Can be text or JSON of IDs
            $table->text('clinical_summary'); // Course in hospital
            $table->text('treatment_given'); 
            
            // Discharge Instructions
            $table->text('discharge_medications'); // Take home meds
            $table->text('follow_up_instructions')->nullable();
            $table->date('follow_up_date')->nullable();
            
            // Outcome
            $table->string('outcome', 50)->default('Recovered'); // Recovered, Referred, DAMA, Deceased
            
            $table->foreignId('doctor_user_id')->constrained('users');
            $table->timestamp('summarized_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_discharge_summaries');
    }
};