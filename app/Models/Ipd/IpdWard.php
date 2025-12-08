<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IpdWard extends Model
{
    // FIX: Use empty array to match OpdTreatmentPoint and bypass schema check
    protected $guarded = [];

    public function rooms(): HasMany
    {
        return $this->hasMany(IpdRoom::class, 'ward_id');
    }
}