<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mr_examinations', function (Blueprint $table) {
            $table->id();

            // ---------------------------------------------------------
            // POLYMORPHIC RELATIONS
            // ---------------------------------------------------------
            // Creates 'examinable_id' (bigint) and 'examinable_type' (string)
            // Links to: App\Models\Opd\OpdBooking OR App\Models\Ipd\IpdWardRound
            $table->morphs('examinable');

            // ---------------------------------------------------------
            // GENERAL APPEARANCE & VITALS CONTEXT
            // ---------------------------------------------------------
            $table->string('general_condition', 255)->nullable()->comment('e.g. Sick looking, stable');
            $table->string('glasgow_coma_score', 50)->nullable()->comment('e.g. 15/15');
            
            // ---------------------------------------------------------
            // CLINICAL SIGNS (0 = Absent, 1+ = Severity or Present)
            // ---------------------------------------------------------
            $table->integer('pallor')->default(0); 
            $table->integer('jaundice')->default(0);
            $table->integer('cyanosis')->default(0); // Added common missing field
            $table->integer('rash')->default(0);
            $table->integer('neck_stiffness')->default(0);
            $table->integer('finger_clubbing')->default(0);
            $table->integer('oral_thrush')->default(0);
            
            // Oedema is often specific (Pedal, Sacral, Anasarca)
            $table->string('oedema', 100)->nullable(); 
            
            // Nutritional (e.g., Wasted, Obese, Normal) or Integer score
            $table->string('nutritional_status', 100)->nullable(); 

            // Lymph Nodes
            // Stores checked items e.g., "Cervical,Axillary"
            $table->string('lymphadenopathy_locations', 255)->nullable(); 
            $table->text('lymphadenopathy_notes')->nullable();

            // ---------------------------------------------------------
            // SYSTEMIC EXAMINATION (Text Blocks)
            // ---------------------------------------------------------
            
            // CVS (Cardiovascular)
            $table->text('cvs_examination')->nullable(); // Legacy: cadiovascularsystem
            $table->string('murmurs', 100)->nullable();
            
            // RS (Respiratory)
            $table->text('rs_examination')->nullable(); // Legacy: respirationremark
            
            // CNS (Central Nervous System)
            $table->text('cns_examination')->nullable(); // Legacy: centralnervoussystem
            
            // PA (Per Abdomen / GI)
            $table->text('abdomen_examination')->nullable(); // Legacy: perabdomen
            
            // HEENT (Head, Eyes, Ears, Nose, Throat)
            $table->text('heent_examination')->nullable(); // Legacy: heent
            
            // GU (Genitourinary)
            $table->text('gu_examination')->nullable(); // Legacy: genitourinarysystem
            
            // MSS (Musculoskeletal)
            $table->text('mss_examination')->nullable(); // Legacy: muscularskeletal
            
            // Skin / Integumentary
            $table->text('skin_examination')->nullable(); // Legacy: integumentarysystem
            
            // Local / Specific Exam
            $table->text('local_examination')->nullable();
            
            // Catch-all
            $table->text('other_findings')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mr_examinations');
    }
};