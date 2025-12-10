<?php

namespace App\Models\Radiology;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\Patient\Patient;
use App\Models\User;

class RadRequest extends Model
{
    protected $table = 'rad_requests';
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function procedure()
    {
        return $this->belongsTo(RadProcedure::class, 'rad_procedure_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the report associated with this request.
     */
    public function report()
    {
        // One Request has One Report
        return $this->hasOne(RadReport::class, 'rad_request_id');
    }
}