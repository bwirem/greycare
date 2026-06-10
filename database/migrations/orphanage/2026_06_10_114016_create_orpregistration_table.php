<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orpregistration', function (Blueprint $table) {

            $table->id('autocode');

            $table->dateTime('sysdate')->nullable();

            $table->dateTime('transdate')->nullable();

            $table->string('childcode', 50)->nullable();

            $table->string('first_name');

            $table->string('middle_name')->nullable();

            $table->string('last_name')->index();

            $table->string('gender', 10); // Male, Female, Other

            $table->date('date_of_birth');           

            $table->unsignedBigInteger('registration_type_id');

            $table->enum('status', [
                'Registered',
                'Adopted',
                'Discharged',
                'Transferred',
                'Inactive'
            ])->default('Registered');

            $table->string('institution', 255)->nullable();

            $table->string('physicaladdress', 255)->nullable();

            $table->string('contact', 50)->nullable();

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->timestamps();

            $table->foreign('registration_type_id')
                ->references('autocode')
                ->on('orpregistrationtype')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orpregistration');
    }
};