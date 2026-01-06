<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\User;

class RchAncVisit extends Model
{
    use HasFactory;

    protected $table = 'rch_anc_visits';

    protected $fillable = [
        'pregnancy_id',
        'opd_booking_id',
        'gestational_age_weeks',
        'fundal_height_cm',
        'fetal_lie',
        'fetal_heart_rate',
        'urine_albumin',
        'syphilis_result',
        'hiv_status',
        'arv_prophylaxis',
        'ipt_malaria',
        'tt_vaccine',
        'iron_folate',
        'deworming',
        'remarks',
        'created_by'
    ];

    protected $casts = [
        'arv_prophylaxis' => 'boolean',
        'ipt_malaria' => 'boolean',
        'tt_vaccine' => 'boolean',
        'iron_folate' => 'boolean',
        'deworming' => 'boolean',
    ];

    public function pregnancy()
    {
        return $this->belongsTo(RchAncPregnancy::class, 'pregnancy_id');
    }

    public function opdBooking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
