<?php

namespace App\Models\BloodBank;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class BbDiscard extends Model
{
    protected $table = 'bb_discards';
    protected $guarded = [];

    public function bag()
    {
        return $this->belongsTo(BbBloodBag::class, 'bb_blood_bag_id');
    }

    public function disposedBy()
    {
        return $this->belongsTo(User::class, 'disposed_by');
    }
}