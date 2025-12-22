<?php

namespace App\Models\Opd\Config;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class DoctorSpecialization extends Model
{
    protected $table = 'doctor_specializations';
    protected $guarded = [];

    /**
     * Get the charge rules for this specialization.
     */
    public function chargeRules()
    {
        return $this->hasMany(ConsultationChargeRule::class, 'specialization_id');
    }

    /**
     * Get doctors belonging to this specialization.
     */
    public function doctors()
    {
        return $this->hasMany(User::class, 'specialization_id');
    }

    /**
     * Helper to get a specific rule (New vs Revisit).
     * Usage: $spec->getRule('new');
     */
    public function getRule(string $visitType) 
    {
        return $this->chargeRules()->where('visit_type', $visitType)->first();
    }
}