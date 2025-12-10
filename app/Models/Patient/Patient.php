<?php

namespace App\Models\Patient;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\Appointment; // <--- Added this import
use App\Models\MedicalRecord\MrVitalSign;
use Carbon\Carbon;

class Patient extends Model
{
    // Defined in migration: $table->string('code', 50)->primary();
    protected $primaryKey = 'code';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $appends = ['age'];

    protected $guarded = []; 

       
    // Casts ensure data types are handled correctly in PHP
    protected $casts = [
        //'date_of_birth' => 'date',
        'date_of_birth' => 'date:Y-m-d',
        'date_of_death' => 'datetime',
        'is_admitted' => 'boolean',
        'is_deceased' => 'boolean',
        'has_disability' => 'boolean',
    ];

    /**
     * Accessor: Get Full Name automatically.
     * Usage: $patient->full_name
     */
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim("{$this->first_name} {$this->middle_name} {$this->last_name}"),
        );
    }

    /**
     * Accessor: Calculate Age dynamically.
     * Usage: $patient->age
     */
   
    // protected function age(): Attribute
    // {
    //     return Attribute::make(
    //         get: fn () => $this->date_of_birth ? Carbon::parse($this->date_of_birth)->age : null,
    //     );
    // }

    public function getAgeAttribute()
    {
        return $this->date_of_birth
            ? Carbon::parse($this->date_of_birth)->age
            : null;
    }

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