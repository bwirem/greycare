<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\Patient\Patient;
use App\Models\User;

class MrPatientDiagnosisConfirmed extends Model
{
    protected $table = 'mr_patient_diagnoses_confirmed';
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Polymorphic relation to master diagnosis tables.
     * Requires 'diagnosis_id' and 'diagnosis_type'.
     */
    public function diagnosis()
    {
        return $this->morphTo();
    }
}