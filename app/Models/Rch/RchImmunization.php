<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class RchImmunization extends Model
{
    use HasFactory;

    protected $table = 'rch_immunizations';

    protected $fillable = [
        'patient_code',
        'opd_booking_id',
        'vaccine_id',
        'administered_date',
        'batch_number',
        'remarks',
        'created_by'
    ];

    protected $casts = [
        'administered_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_code', 'code');
    }

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function vaccine()
    {
        return $this->belongsTo(RchVaccine::class, 'vaccine_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}