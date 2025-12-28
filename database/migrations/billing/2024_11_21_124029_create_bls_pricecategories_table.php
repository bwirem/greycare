<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('bls_pricecategories', function (Blueprint $table) {
            $table->id();            
            $table->integer('useprice1'); 
            $table->integer('useprice2');
            $table->integer('useprice3');
            $table->integer('useprice4');
            $table->integer('useprice5');
            $table->integer('useprice6');
            $table->integer('useprice7');
            $table->integer('useprice8');
            $table->integer('useprice9');
            $table->integer('useprice10');
            $table->string('price1');  
            $table->string('price2'); 
            $table->string('price3'); 
            $table->string('price4'); 
            $table->string('price5');
            $table->string('price6'); 
            $table->string('price7'); 
            $table->string('price8'); 
            $table->string('price9'); 
            $table->string('price10'); 
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bls_pricecategories');
    }
};
