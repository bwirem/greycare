<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class IpdDischargeLog extends Model
{
    protected $table = 'ipd_discharge_logs';
    protected $guarded = [];

    public function admissionLog()
    {
        return $this->belongsTo(IpdAdmissionLog::class, 'ipd_admission_log_id');
    }

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Location at Discharge
    public function ward()
    {
        return $this->belongsTo(IpdWard::class, 'ward_id');
    }

    public function room()
    {
        return $this->belongsTo(IpdRoom::class, 'room_id');
    }

    public function bed()
    {
        return $this->belongsTo(IpdBed::class, 'bed_id');
    }

    // Discharge Status Master Link
    public function dischargeStatus()
    {
        return $this->belongsTo(IpdDischargeStatus::class, 'discharge_status_id');
    }
}