<?php

namespace App\Models\BloodBank;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class BbDonation extends Model
{
    protected $table = 'bb_donations';
    protected $guarded = [];

    public function donor()
    {
        return $this->belongsTo(BbDonor::class, 'bb_donor_id');
    }

    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    /**
     * Get the blood bag generated from this donation.
     */
    public function bag()
    {
        return $this->hasOne(BbBloodBag::class, 'bb_donation_id');
    }
}