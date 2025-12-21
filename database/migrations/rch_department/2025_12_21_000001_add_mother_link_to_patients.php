<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('mother_patient_code', 50)->nullable()->after('national_id')->index();
            $table->foreign('mother_patient_code')->references('code')->on('patients')->nullOnDelete();
        });
    }
    public function down(): void {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['mother_patient_code']);
            $table->dropColumn('mother_patient_code');
        });
    }
};