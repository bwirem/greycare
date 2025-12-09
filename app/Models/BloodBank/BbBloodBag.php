<?php

namespace App\Models\BloodBank;

use Illuminate\Database\Eloquent\Model;

class BbBloodBag extends Model
{
    protected $table = 'bb_blood_bags';
    protected $guarded = [];

    protected $casts = [
        'collected_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function donation()
    {
        return $this->belongsTo(BbDonation::class, 'bb_donation_id');
    }

    public function componentType()
    {
        return $this->belongsTo(BbComponentType::class, 'bb_component_type_id');
    }
}