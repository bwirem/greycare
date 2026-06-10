<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orpadoptativeparents', function (Blueprint $table) {
            $table->id('autocode');
            $table->dateTime('sysdate')->nullable();
            $table->dateTime('transdate')->nullable();
            
            $table->string('childcode', 50)->nullable()->default('');
            $table->string('adoptivefather', 50)->nullable()->default('');
            $table->string('adoptivemother', 50)->nullable()->default('');
            $table->string('maritalstatus', 50)->nullable()->default('');
            $table->string('numberofbloodchildren', 50)->nullable()->default('');
            $table->string('numberofadoptedchildren', 50)->nullable()->default('');
            $table->string('profession', 50)->nullable()->default('');
            $table->string('physicaladdress', 50)->nullable()->default('');
            $table->string('contact', 50)->nullable()->default('');
            
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orpadoptativeparents');
    }
};