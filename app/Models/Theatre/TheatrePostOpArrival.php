<?php

namespace App\Models\Theatre;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TheatrePostOpArrival extends Model
{
    protected $table = 'theatre_post_op_arrivals';
    protected $guarded = [];

    protected $casts = [
        'is_awake' => 'boolean',
        'is_rousable' => 'boolean',
        'is_unconscious' => 'boolean',
        'is_in_pain' => 'boolean',
        'airway_intact' => 'boolean',
        'ventilated' => 'boolean',
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