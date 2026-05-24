<?php

namespace App\Models\Diagnosis;

use Illuminate\Database\Eloquent\Model;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;

class DxtDiagnosesIcd extends Model
{
    protected $table = 'dxt_diagnoses_icd';
    protected $guarded = [];

    public function group()
    {
        return $this->belongsTo(DxtDiagnosesGroup::class, 'dxt_diagnoses_group_id');
    }

    // --- NEW RELATIONSHIPS ---

    // Get OPD diagnoses that map to this ICD code
    public function opdMappings()
    {
        // Foreign key on Opd table is 'exact_codes', Local key here is 'code'
        return $this->hasMany(DxtDiagnosesOpd::class, 'exact_codes', 'code');
    }

    // Get IPD diagnoses that map to this ICD code
    public function ipdMappings()
    {
        return $this->hasMany(DxtDiagnosesIpd::class, 'exact_codes', 'code');
    }

    // Polymorphic Relations
    public function confirmedDiagnoses()
    {
        return $this->morphMany(MrPatientDiagnosisConfirmed::class, 'diagnosis');
    }

    public function provisionalDiagnoses()
    {
        return $this->morphMany(MrPatientDiagnosisProvisional::class, 'diagnosis');
    }
}