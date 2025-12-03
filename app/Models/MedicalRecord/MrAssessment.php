<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;

class MrAssessment extends Model
{
    protected $table = 'mr_assessments';
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function complains()
    {
        return $this->hasMany(MrAssessmentComplain::class, 'mr_assessment_id');
    }
}