<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bb_discards', function (Blueprint $table) {
            $table->id();

            // The Bag being thrown away
            $table->foreignId('bb_blood_bag_id')->constrained('bb_blood_bags');
            
            // Reason
            $table->string('reason_category'); // Expired, TTI Positive, Leakage, Hemolyzed
            $table->text('remarks')->nullable();
            
            $table->foreignId('disposed_by')->constrained('users');
            $table->dateTime('disposed_at')->useCurrent();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bb_discards');
    }
};