<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_sample_rejection_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_prescription_id')->nullable()                     
                    ->constrained('lab_prescriptions')->cascadeOnDelete();
            $table->foreignId('lab_sample_id')->nullable()
                    ->constrained('lab_samples')->cascadeOnDelete();            
            $table->foreignId('lab_rejection_reason_id')->nullable()
                    ->constrained('lab_rejection_reasons');            
            $table->string('remarks', 500)->nullable();
            $table->foreignId('rejected_by')->constrained('users');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_sample_rejection_logs');
    }
};