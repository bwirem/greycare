<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class LabResult extends Model
{
    protected $table = 'lab_results';
    protected $guarded = [];

    public function sample()
    {
        return $this->belongsTo(LabSample::class, 'lab_sample_id');
    }

    public function parameter()
    {
        return $this->belongsTo(LabTestParameter::class, 'lab_test_parameter_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_user_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}