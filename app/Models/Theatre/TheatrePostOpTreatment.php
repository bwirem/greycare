<?php

namespace App\Models\Theatre;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TheatrePostOpTreatment extends Model
{
    protected $table = 'theatre_post_op_treatments';
    protected $guarded = [];

    protected $casts = [
        'extubated' => 'boolean',
        'oxygen_therapy' => 'boolean',
    ];

    public function booking()
    {
        return $this->belongsTo(TheatreBooking::class, 'theatre_booking_id');
    }

    public function nurse()
    {
        return $this->belongsTo(User::class, 'nurse_user_id');
    }
}