<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_results', function (Blueprint $table) {
            $table->id();

            // Link to the Physical Sample
            $table->foreignId('lab_sample_id')->constrained('lab_samples')->cascadeOnDelete();
            
            // Link to the Specific Parameter (e.g. WBC)
            $table->foreignId('lab_test_parameter_id')->constrained('lab_test_parameters')->restrictOnDelete();

            // The Result
            $table->string('result_value', 255)->nullable();
            
            // Flags
            $table->boolean('is_abnormal')->default(false);
            $table->boolean('is_critical')->default(false);
            $table->string('remarks', 255)->nullable();

            // Audit
            $table->foreignId('technician_user_id')->nullable()->constrained('users');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_results');
    }
};