<?php
namespace App\Models\Physiotherapy;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class PhySession extends Model
{
    protected $table = 'phy_sessions';
    protected $fillable = [
        'patient_code', 'opd_booking_id', 'aims_of_therapy', 
        'therapist_feedback', 'session_start', 'session_end', 
        'authorization_number', 'created_by'
    ];

    protected $casts = [
        'session_start' => 'datetime',
        'session_end' => 'datetime',
    ];

    public function patient() {
        return $this->belongsTo(Patient::class, 'patient_code', 'code');
    }
    
    public function booking() {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function treatments() {
        return $this->hasMany(PhySessionItem::class, 'phy_session_id');
    }
}