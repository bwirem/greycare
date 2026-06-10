<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orpadoptationtype', function (Blueprint $table) {

            $table->id('autocode');

            $table->string('CODE', 50)
                ->nullable()
                ->index();

            $table->string('description', 255)
                ->nullable();

            $table->integer('orphanagetoorphanages')
                ->default(0);

            $table->integer('orphanagetoadoptiveparent')
                ->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orpadoptationtype');
    }
};