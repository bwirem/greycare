<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;

class MrHistory extends Model
{
    protected $table = 'mr_histories';
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    /**
     * Relationship to Complaints (Child Table)
     */
    public function complains()
    {
        return $this->hasMany(MrHistoryComplain::class, 'mr_history_id');
    }
}