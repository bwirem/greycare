<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_samples', function (Blueprint $table) {
            $table->id();
            
            // Link to the Request
            $table->foreignId('lab_prescription_id')->constrained('lab_prescriptions')->cascadeOnDelete();
            
            // Barcode
            $table->string('sample_code', 50)->unique();
            
            // Sample Type
            $table->foreignId('lab_nature_of_sample_id')->nullable()->constrained('lab_nature_of_samples');

            // Collection Details
            $table->dateTime('collected_at')->nullable();
            $table->foreignId('collected_by')->nullable()->constrained('users');
            
            $table->dateTime('accepted_at')->nullable(); // Lab Acceptance

            $table->text('notes')->nullable();
            
            $table->string('status', 50)->default('Collected'); // Collected, Rejected, Accepted

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_samples');
    }
};