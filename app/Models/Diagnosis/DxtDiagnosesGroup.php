<?php

namespace App\Models\Diagnosis;

use Illuminate\Database\Eloquent\Model;

class DxtDiagnosesGroup extends Model
{
    protected $table = 'dxt_diagnoses_groups';
    protected $guarded = [];

    // Optional: Helper to get related diagnoses
    public function icdDiagnoses()
    {
        return $this->hasMany(DxtDiagnosesIcd::class, 'dxt_diagnoses_group_id');
    }
}