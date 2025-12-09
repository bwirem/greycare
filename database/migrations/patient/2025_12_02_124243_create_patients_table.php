<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->string('code', 50)->primary();
            
            $table->string('surname')->index();
            $table->string('firstname');
            $table->string('othernames')->nullable();
            $table->string('gender', 10);
            $table->date('birthdate');
            
            // Demographics & Medical
            $table->string('national_id')->unique()->nullable();
            $table->string('maritalstatus_id')->nullable();
            $table->text('chronic')->nullable();          
            $table->text('operations')->nullable();
            $table->text('allergies')->nullable(); 

            // Registration info
            $table->dateTime('regdate');
            $table->string('patientsource')->nullable();  
            
            $table->boolean('is_admitted')->default(false);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('patients');
    }
};
