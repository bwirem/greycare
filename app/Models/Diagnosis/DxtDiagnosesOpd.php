<?php

namespace App\Models\Diagnosis;

use Illuminate\Database\Eloquent\Model;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;

class DxtDiagnosesOpd extends Model
{
    protected $table = 'mr_mtuha_mappings_opd';
    protected $guarded = [];
    protected $casts = [
        'exact_codes' => 'array',
        'ranges'      => 'array',
    ];

    public function group()
    {
        return $this->belongsTo(DxtDiagnosesGroup::class, 'dxt_diagnoses_group_id');
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

     // Relationship to get the ICD details
    public function icdMap()
    {
        // 2nd arg: local column (maptocode), 3rd arg: target column (code in ICD table)
        return $this->belongsTo(DxtDiagnosesIcd::class, 'maptocode', 'code');
    }
}