<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class LabSampleRejectionLog extends Model
{
    protected $table = 'lab_sample_rejection_logs';
    protected $guarded = [];

    public function reason()
    {
        return $this->belongsTo(LabRejectionReason::class, 'lab_rejection_reason_id');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}