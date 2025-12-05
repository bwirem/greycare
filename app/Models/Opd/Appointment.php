<?php

namespace App\Models\Opd;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\User;

class Appointment extends Model
{
    protected $table = 'opd_appointments';
    protected $guarded = [];

    protected $casts = [
        'appointment_date' => 'datetime',
    ];

    // --- Relationships ---

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_user_id');
    }

    public function clinic()
    {
        return $this->belongsTo(OpdTreatmentPoint::class, 'clinic_id');
    }

    /**
     * If this appointment was converted to an actual visit, 
     * this links to the medical/billing record.
     */
    public function visit()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    // --- Generators ---

    /**
     * Boot function to auto-generate Appointment Number (APT-YYYY-ID)
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($appointment) {
            $appointment->appointment_number = 'APT-' . date('Y') . '-' . str_pad($appointment->id, 5, '0', STR_PAD_LEFT);
            $appointment->saveQuietly();
        });
    }
}