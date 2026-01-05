<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('theatres', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Main Theatre", "Minor OT"
            $table->string('code')->nullable(); // e.g., "OT-01"
            $table->string('type')->default('General'); // General, Ortho, Cardio, etc.
            $table->string('location')->nullable(); // e.g., "2nd Floor, Wing B"
            $table->boolean('is_active')->default(true); // To handle maintenance/closure
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('theatres');
    }
};