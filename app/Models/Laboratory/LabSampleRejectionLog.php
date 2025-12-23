<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class LabSampleRejectionLog extends Model
{
    protected $table = 'lab_sample_rejection_logs';
    protected $guarded = [];

    // Optional: Request Rejection
    public function prescription()
    {
        return $this->belongsTo(LabPrescription::class, 'lab_prescription_id');
    }

    // Optional: Sample Rejection (Post-collection)
    public function sample()
    {
        return $this->belongsTo(LabSample::class, 'lab_sample_id');
    }


    public function reason()
    {
        return $this->belongsTo(LabRejectionReason::class, 'lab_rejection_reason_id');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}