<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdWardRound;
use App\Models\Patient\Patient;
use App\Models\User;

class MrVitalSign extends Model
{
    protected $table = 'mr_vital_signs';
    protected $guarded = [];

    // --- Context Relationships ---

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function admission()
    {
        return $this->belongsTo(IpdAdmission::class, 'ipd_admission_id');
    }

    public function wardRound()
    {
        return $this->belongsTo(IpdWardRound::class, 'ipd_ward_round_id');
    }

    // --- Core Relationships ---

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function user() // Nurse/Doctor who took vitals
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}