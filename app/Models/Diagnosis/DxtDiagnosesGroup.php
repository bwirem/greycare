<?php

namespace App\Models\Diagnosis;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DxtDiagnosesGroup extends Model
{
    protected $table = 'dxt_diagnoses_groups';
    protected $guarded = []; // Fixes SQL Error

    public function icdDiagnoses(): HasMany
    {
        return $this->hasMany(DxtDiagnosesIcd::class, 'dxt_diagnoses_group_id');
    }
}