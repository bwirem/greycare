<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class IpdDischargeSummary extends Model
{
    protected $guarded = [];

    protected $casts = [
        'follow_up_date' => 'date',
        'summarized_at' => 'datetime',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_user_id');
    }
}