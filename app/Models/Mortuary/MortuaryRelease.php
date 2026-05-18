<?php

namespace App\Models\Mortuary;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class MortuaryRelease extends Model
{
    protected $fillable = [
        'mortuary_record_id', 'receiver_name', 'receiver_id_number', 
        'relationship', 'remarks', 'released_at', 'released_by_user_id'
    ];

    protected $casts = [
        'released_at' => 'datetime',
    ];

    public function record()
    {
        return $this->belongsTo(MortuaryRecord::class, 'mortuary_record_id');
    }

    public function releaser()
    {
        return $this->belongsTo(User::class, 'released_by_user_id');
    }
}