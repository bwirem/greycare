<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class LabSample extends Model
{
    protected $table = 'lab_samples';
    protected $guarded = [];

    public function prescription()
    {
        return $this->belongsTo(LabPrescription::class, 'lab_prescription_id');
    }

    public function sampleType()
    {
        return $this->belongsTo(LabNatureOfSample::class, 'lab_nature_of_sample_id');
    }

    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    /**
     * Get all results linked to this sample.
     */
    public function results()
    {
        return $this->hasMany(LabResult::class, 'lab_sample_id');
    }

    public function rejectionLog()
    {
        return $this->hasOne(LabSampleRejectionLog::class, 'lab_sample_id');
    }
}