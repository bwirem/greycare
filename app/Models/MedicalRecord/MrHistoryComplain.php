<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;

class MrHistoryComplain extends Model
{
    protected $table = 'mr_history_complains';
    protected $guarded = [];

    public function booking()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function history()
    {
        return $this->belongsTo(MrHistory::class, 'mr_history_id');
    }
}