<?php

namespace App\Models\BloodBank;

use Illuminate\Database\Eloquent\Model;

class BbDonor extends Model
{
    protected $table = 'bb_donors';
    protected $guarded = [];

    /**
     * Get the donations for this donor.
     */
    public function donations()
    {
        return $this->hasMany(BbDonation::class, 'bb_donor_id');
    }
}