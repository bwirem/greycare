<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Billing\BLSItem;

class IpdWard extends Model
{
    // FIX: Use empty array to match OpdTreatmentPoint and bypass schema check
    protected $guarded = [];

    public function rooms(): HasMany
    {
        return $this->hasMany(IpdRoom::class, 'ward_id');
    }

   // app/Models/Ipd/IpdWard.php
    public function blsItem()
    {
        // hasOne returns a Single Model instance.
        // Models HAVE an update() method.
        return $this->hasOne(BLSItem::class, 'ipd_ward_id');
    }
}

