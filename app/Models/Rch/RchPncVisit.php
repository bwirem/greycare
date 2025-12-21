<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class RchPncVisit extends Model
{
    use HasFactory;

    protected $table = 'rch_pnc_visits';

    protected $fillable = [
        'patient_code',
        'opd_booking_id',
        'delivery_id',
        'visit_date', // Note: Make sure migration has this, or use created_at
        'timing', // 48hrs, 7days, 42days
        'uterus_involution',
        'lochia_status',
        'c_section_wound',
        'vitamin_a_given',
        'counseling_given',
        'created_by'
    ];

    protected $casts = [
        'vitamin_a_given' => 'boolean',
        'visit_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_code', 'code');
    }

    public function delivery()
    {
        return $this->belongsTo(RchDelivery::class, 'delivery_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}