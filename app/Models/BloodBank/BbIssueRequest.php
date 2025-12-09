<?php

namespace App\Models\BloodBank;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdAdmission;
use App\Models\Patient\Patient;
use App\Models\User;

class BbIssueRequest extends Model
{
    protected $table = 'bb_issue_requests';
    protected $guarded = [];

    // --- Relationships ---

    public function opdBooking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function ipdAdmission()
    {
        return $this->belongsTo(IpdAdmission::class, 'ipd_admission_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function componentType()
    {
        return $this->belongsTo(BbComponentType::class, 'bb_component_type_id');
    }

    /**
     * If a specific bag was issued directly (rare, usually goes via crossmatch)
     */
    public function issuedBag()
    {
        return $this->belongsTo(BbBloodBag::class, 'issued_bag_id');
    }
}