<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\User;
use App\Models\Patient\Patient;


class LabPrescription extends Model
{
    protected $table = 'lab_prescriptions';
    protected $guarded = [];

    // --- Relationships ---

    public function visit()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'doctor_user_id');
    }

    public function panel()
    {
        return $this->belongsTo(LabPanel::class, 'lab_panel_id');
    }

    /**
     * Get the sample collected for this request.
     */
    public function sample()
    {
        return $this->hasOne(LabSample::class, 'lab_prescription_id');
    }

    /**
     * Get the rejection details if the request was rejected.
     * We use latestOfMany() in case there are multiple logs (rare, but safe).
     */
    public function rejectionLog()
    {
        return $this->hasOne(LabSampleRejectionLog::class, 'lab_prescription_id')->latestOfMany();
    }
}