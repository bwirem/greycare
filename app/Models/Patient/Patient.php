<?php

namespace App\Models\Patient;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Opd\OpdBooking;
use App\Models\MedicalRecord\MrVitalSign;

class Patient extends Model
{
    // Defined in migration: $table->string('code', 50)->primary();
    protected $primaryKey = 'code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];

    public function bookings(): HasMany
    {
        return $this->hasMany(OpdBooking::class, 'patientcode', 'code');
    }

    public function vitals(): HasMany
    {
        return $this->hasMany(MrVitalSign::class, 'patientcode', 'code');
    }
}