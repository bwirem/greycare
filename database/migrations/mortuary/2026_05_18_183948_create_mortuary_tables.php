<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mortuary Records Table
        Schema::create('mortuary_records', function (Blueprint $table) {
            $table->id();
            $table->string('patient_code')->nullable()->comment('If known from hospital system');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('gender', 20);
            $table->integer('age')->nullable();
            $table->dateTime('date_of_death');

            // Made nullable: Location and billing aren't assigned until the body is actually stored
            $table->foreignId('mortuary_id')->nullable();
            $table->foreignId('room_id')->nullable();
            $table->foreignId('cabinet_id')->nullable(); 
            $table->string('cabinet_number')->nullable();
            $table->foreignId('billing_group_id')->nullable();
            
            $table->string('cause_of_death')->nullable();
            
            $table->enum('status', ['Pending', 'Stored', 'Released'])->default('Pending');
            
            // Made nullable: Mortuary staff hasn't received it yet when status is 'Pending'
            $table->foreignId('received_by_user_id')->nullable()->constrained('users');
            
            $table->timestamps();
        });

        // 2. Mortuary Releases Table
        Schema::create('mortuary_releases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mortuary_record_id')->constrained()->onDelete('cascade');
            $table->string('receiver_name');
            $table->string('receiver_id_number')->nullable();
            $table->string('relationship');
            $table->text('remarks')->nullable();
            $table->dateTime('released_at');
            $table->foreignId('released_by_user_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mortuary_releases');
        Schema::dropIfExists('mortuary_records');
    }
};