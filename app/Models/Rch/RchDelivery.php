<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class RchDelivery extends Model
{
    use HasFactory;

    protected $table = 'rch_deliveries';

    protected $fillable = [
        'pregnancy_id',
        'ipd_admission_id',
        'opd_booking_id',
        'delivery_datetime',
        'mode_of_delivery', // SVD, C-Section, etc
        'outcome',          // Live Birth, Still Birth
        'placenta_delivery',
        'complications',
        'blood_loss_ml',
        'child_gender',
        'birth_weight_kg',
        'apgar_score_1min',
        'apgar_score_5min',
        'conducted_by'
    ];

    protected $casts = [
        'delivery_datetime' => 'datetime',
    ];

    public function pregnancy()
    {
        return $this->belongsTo(RchAncPregnancy::class, 'pregnancy_id');
    }

    public function conductor()
    {
        return $this->belongsTo(User::class, 'conducted_by');
    }
}