<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdWardRound;
use App\Models\Patient\Patient;
use App\Models\User;
use App\Models\Diagnosis\DxtDiagnosesIcd;

class MrPatientDiagnosisIcdProvisional extends Model
{
    protected $table = 'mr_patient_diagnoses_icd_provisional';
    protected $guarded = [];

    // --- Context ---
    public function booking() { return $this->belongsTo(OpdBooking::class, 'opd_booking_id'); }
    public function admission() { return $this->belongsTo(IpdAdmission::class, 'ipd_admission_id'); }
    public function wardRound() { return $this->belongsTo(IpdWardRound::class, 'ipd_ward_round_id'); }
    public function patient() { return $this->belongsTo(Patient::class, 'patientcode', 'code'); }
    public function user() { return $this->belongsTo(User::class, 'user_id'); }

    // --- Specific Link to ICD Master ---
    public function icdDiagnosis()
    {
        return $this->belongsTo(DxtDiagnosesIcd::class, 'diagnosis_id');
    }
}