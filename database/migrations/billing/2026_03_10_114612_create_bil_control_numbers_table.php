<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bil_control_numbers', function (Blueprint $table) {
            $table->id();
            $table->dateTime('transdate')->nullable();
            
            // Patient details
            $table->string('patient_code')->index(); // Indexed for faster searches
            $table->string('patient_name')->nullable()->index(); 
            
            // Payment identifiers
            $table->string('payment_reference')->nullable()->index();
            $table->string('controlno')->nullable()->index();
            
            // Payment details
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('paymentdescription')->nullable();
            
            // Status: recorded, paid, closed
            $table->string('numberstatus')->default('recorded')->index(); 
            
            // API Gateway returned values upon successful payment check
            $table->string('transaction_ref')->nullable();
            $table->string('receipt_no')->nullable();
            
            // User who initiated/processed the request
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bil_control_numbers');
    }
};
