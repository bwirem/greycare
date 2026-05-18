<?php

namespace App\Models\Mortuary;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class MortuaryRecord extends Model
{
    protected $fillable = [
        'patient_code', 'first_name', 'last_name', 'gender', 'age', 
        'date_of_death', 'cabinet_number', 'cause_of_death', 'status', 'received_by_user_id'
    ];

    protected $casts = [
        'date_of_death' => 'datetime',
    ];

    public function release()
    {
        return $this->hasOne(MortuaryRelease::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by_user_id');
    }
}