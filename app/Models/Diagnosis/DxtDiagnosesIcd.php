<?php

namespace App\Models\Diagnosis;

use Illuminate\Database\Eloquent\Model;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;

class DxtDiagnosesIpd extends Model
{
    protected $table = 'dxt_diagnoses_ipd';
    protected $guarded = [];

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
}