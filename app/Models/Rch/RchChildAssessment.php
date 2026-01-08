<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\User;
// Assuming you have this model from the core system
use App\Models\MedicalRecord\MrVitalSign; 

class RchChildAssessment extends Model
{
    use HasFactory;

    protected $table = 'rch_child_assessments';

    protected $fillable = [
        'patient_code',
        'opd_booking_id',
        'age_months',
        'weight_for_age_status', // Green, Grey, Red
        'height_for_age_status',
        'feeding_practice',      // Exclusive, Mixed, etc.
        'development_milestones',
        'vitamin_a_given',
        'deworming_given',
        'created_by'
    ];

    protected $casts = [
        'vitamin_a_given' => 'boolean',
        'deworming_given' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_code', 'code');
    }

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    // Helper to fetch the actual weight recorded in Vitals for this visit
    public function vitals()
    {
        return $this->hasOne(MrVitalSign::class, 'opd_booking_id', 'opd_booking_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}