<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orpdischarges', function (Blueprint $table) {

            $table->id('autocode');

            $table->dateTime('sysdate')->nullable();

            $table->dateTime('transdate')->nullable();

            $table->string('childcode', 50)
                ->nullable()
                ->default('');

            $table->string('parentname', 50)
                ->nullable()
                ->default('');

            $table->string('guardianname', 50)
                ->nullable()
                ->default('');

            $table->string('relationship', 50)
                ->nullable()
                ->default('');

            $table->string('physicaladdress', 50)
                ->nullable()
                ->default('');

            $table->string('contact', 50)
                ->nullable()
                ->default('');

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orp_discharges');
    }
};