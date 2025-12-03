<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class IpdTransferLog extends Model
{
    protected $table = 'ipd_transfer_logs';
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

    // ----------------------------------------------------
    // Location FROM
    // ----------------------------------------------------
    public function fromWard()
    {
        return $this->belongsTo(IpdWard::class, 'from_ward_id');
    }

    public function fromRoom()
    {
        return $this->belongsTo(IpdRoom::class, 'from_room_id');
    }

    public function fromBed()
    {
        return $this->belongsTo(IpdBed::class, 'from_bed_id');
    }

    // ----------------------------------------------------
    // Location TO
    // ----------------------------------------------------
    public function toWard()
    {
        return $this->belongsTo(IpdWard::class, 'to_ward_id');
    }

    public function toRoom()
    {
        return $this->belongsTo(IpdRoom::class, 'to_room_id');
    }

    public function toBed()
    {
        return $this->belongsTo(IpdBed::class, 'to_bed_id');
    }
}