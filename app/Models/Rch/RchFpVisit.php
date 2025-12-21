<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking; // Assuming this exists based on your schema
use App\Models\User;

class RchFpVisit extends Model
{
    use HasFactory;

    protected $table = 'rch_fp_visits';

    protected $fillable = [
        'patient_code',
        'opd_booking_id',
        'visit_date',
        'weight_kg',
        'bp_systolic',
        'bp_diastolic',
        'method_id',
        'quantity',
        'side_effects',
        'next_appointment_date',
        'created_by'
    ];

    protected $casts = [
        'visit_date' => 'date',
        'next_appointment_date' => 'date',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_code', 'code');
    }

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function method()
    {
        return $this->belongsTo(RchFpMethod::class, 'method_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}