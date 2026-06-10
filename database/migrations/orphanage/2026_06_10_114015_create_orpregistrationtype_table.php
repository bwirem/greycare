<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orpregistrationtype', function (Blueprint $table) {

            $table->id('autocode');

            $table->string('CODE', 50)
                ->nullable()
                ->index();

            $table->string('description', 255)
                ->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orpregistrationtype');
    }
};