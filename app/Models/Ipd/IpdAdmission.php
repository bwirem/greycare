<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class IpdAdmission extends Model
{
    protected $table = 'ipd_admissions';
    protected $guarded = [];

    // Link to Booking
    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    // Link to Patient (String Key)
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    // Link to User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Current Location Relationships
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

    // --- ADD THESE MISSING RELATIONSHIPS ---

    /**
     * Link to the Ward Rounds (Doctor Visits)
     */
    public function wardRounds()
    {
        // Must match the Model name 'IpdWardRound' exactly
        return $this->hasMany(IpdWardRound::class, 'ipd_admission_id')->orderBy('round_date', 'desc');
    }
    
    /**
     * Helper to get the most recent round
     */
    public function latestRound()
    {
        return $this->hasOne(IpdWardRound::class, 'ipd_admission_id')->latestOfMany('round_date');
    }
}