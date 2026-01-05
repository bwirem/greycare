<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('theatre_bookings', function (Blueprint $table) {
            // 1. Add the new Foreign Key column
            // We make it nullable so existing records don't crash
            $table->foreignId('theatre_id')
                  ->nullable()
                  ->after('anesthetist_user_id') // Place it nicely in the table
                  ->constrained('theatres')
                  ->nullOnDelete();

            // 2. (Optional) Drop the old string column if you no longer need "Text" rooms
            // $table->dropColumn('theatre_room'); 
        });
    }

    public function down()
    {
        Schema::table('theatre_bookings', function (Blueprint $table) {
            $table->dropForeign(['theatre_id']);
            $table->dropColumn('theatre_id');
            // $table->string('theatre_room')->nullable(); 
        });
    }
};