<?php

namespace App\Models\Theatre;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\User;
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdAdmission;

class TheatreBooking extends Model
{
    protected $table = 'theatre_bookings';
    protected $guarded = [];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function procedure()
    {
        return $this->belongsTo(TheatreProcedure::class, 'theatre_procedure_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_user_id');
    }

    public function anesthetist()
    {
        return $this->belongsTo(User::class, 'anesthetist_user_id');
    }

    public function opdBooking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function ipdAdmission()
    {
        return $this->belongsTo(IpdAdmission::class, 'ipd_admission_id');
    }

    /**
     * Link to the Theatre Room (The Missing Relationship)
     */
    public function theatre()
    {
        // Assuming you have a Theatre model and theatre_id column
        // If you use 'treatmentpoint_id', change the second argument
        return $this->belongsTo(Theatre::class, 'theatre_id'); 
    }

    public function postOpArrivals()
    {
        return $this->hasMany(TheatrePostOpArrival::class, 'theatre_booking_id');
    }
}