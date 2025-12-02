<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_discharge_statuses', function (Blueprint $table) {
            $table->id(); // Maps to 'autocode'
            $table->string('name'); // Maps to 'description'           
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_discharge_statuses');
    }
};