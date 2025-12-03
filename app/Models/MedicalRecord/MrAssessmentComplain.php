<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;

class MrAssessmentComplain extends Model
{
    protected $table = 'mr_assessment_complains';
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function assessment()
    {
        return $this->belongsTo(MrAssessment::class, 'mr_assessment_id');
    }
}