<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mr_mtuha_mappings_opd', function (Blueprint $table) {
            $table->id();
            $table->string('mtuha_code'); // Using string because of "014a", "014b"
            $table->string('description');
            $table->text('exact_codes')->nullable(); // Stores ["B16", "B18.0"]
            $table->text('ranges')->nullable();      // Stores [["A15", "A19"]]
            $table->integer('priority')->default(1); // 1 = Specific, 2 = Remainder
            // Link to Groups
            $table->foreignId('dxt_diagnoses_group_id')
                ->nullable()
                ->constrained('dxt_diagnoses_groups')
                ->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('mr_mtuha_mappings_ipd', function (Blueprint $table) {
            $table->id();
            $table->string('mtuha_code'); // Using string because of "014a", "014b"
            $table->string('description');
            $table->text('exact_codes')->nullable(); // Stores ["B16", "B18.0"]
            $table->text('ranges')->nullable();      // Stores [["A15", "A19"]]
            $table->integer('priority')->default(1); // 1 = Specific, 2 = Remainder
            // Link to Groups
            $table->foreignId('dxt_diagnoses_group_id')
                ->nullable()
                ->constrained('dxt_diagnoses_groups')
                ->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('mr_mtuha_mappings_dental', function (Blueprint $table) {
            $table->id();
            $table->string('mtuha_code'); // Using string because of "014a", "014b"
            $table->string('description');
            $table->text('exact_codes')->nullable(); // Stores ["B16", "B18.0"]
            $table->text('ranges')->nullable();      // Stores [["A15", "A19"]]
            $table->integer('priority')->default(1); // 1 = Specific, 2 = Remainder
            // Link to Groups
            $table->foreignId('dxt_diagnoses_group_id')
                ->nullable()
                ->constrained('dxt_diagnoses_groups')
                ->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('mr_mtuha_mappings_eye', function (Blueprint $table) {
            $table->id();
            $table->string('mtuha_code'); // Using string because of "014a", "014b"
            $table->string('description');
            $table->text('exact_codes')->nullable(); // Stores ["B16", "B18.0"]
            $table->text('ranges')->nullable();      // Stores [["A15", "A19"]]
            $table->integer('priority')->default(1); // 1 = Specific, 2 = Remainder
            // Link to Groups
            $table->foreignId('dxt_diagnoses_group_id')
                ->nullable()
                ->constrained('dxt_diagnoses_groups')
                ->nullOnDelete();
            $table->timestamps();
        });         

    }

    public function down()
    {
        Schema::dropIfExists('mr_mtuha_mappings_opd');
        Schema::dropIfExists('mr_mtuha_mappings_ipd');
        Schema::dropIfExists('mr_mtuha_mappings_dental');
        Schema::dropIfExists('mr_mtuha_mappings_eye');
    }
};