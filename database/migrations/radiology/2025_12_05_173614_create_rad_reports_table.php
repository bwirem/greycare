<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rad_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rad_request_id')->constrained('rad_requests')->cascadeOnDelete();

            // Textual Report
            $table->text('findings')->nullable(); // Detailed observation
            $table->text('impression')->nullable(); // Conclusion/Diagnosis
            $table->text('suggestion')->nullable(); // Recommendation

            // --- PACS LINKING ---
            // The UID identifying the folder of images in the PACS server
            $table->string('study_instance_uid', 100)->nullable()->index();
            // Direct URL to open a viewer (e.g., Orthanc/Dcm4chee web viewer)
            $table->string('pacs_url', 500)->nullable();

            // Status
            $table->string('status', 50)->default('Draft'); // Draft, Final, Addendum
            
            // Personnel
            $table->foreignId('radiologist_id')->constrained('users'); // Who wrote the report
            // Changed from dateTime() to timestamp() to allow useCurrent()
            $table->timestamp('reported_at')->useCurrent();
            
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rad_reports');
    }
};