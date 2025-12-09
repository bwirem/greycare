<?php

namespace App\Models\Patient;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\Appointment; // <--- Added this import
use App\Models\MedicalRecord\MrVitalSign;

class Patient extends Model
{
    // Defined in migration: $table->string('code', 50)->primary();
    protected $primaryKey = 'code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];   

    protected $casts = [
        'is_admitted' => 'boolean',
    ];

    /**
     * Get actual Medical/Billing Visits (OPD Bookings)
     * Alias 1: bookings
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(OpdBooking::class, 'patientcode', 'code');
    }

    /**
     * Get actual Medical/Billing Visits (OPD Bookings)
     * Alias 2: visits (Preferred semantic name)
     */
    public function visits()
    {
        return $this->hasMany(OpdBooking::class, 'patientcode', 'code');
    }

    /**
     * Get Calendar Appointments (Intentions to visit)
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patientcode', 'code');
    }

    public function vitals(): HasMany
    {
        return $this->hasMany(MrVitalSign::class, 'patientcode', 'code');
    }

    // Helper to get File Number (Just an alias for code, based on your logic)
    public function getFileNumberAttribute()
    {
        return $this->code;
    }
}