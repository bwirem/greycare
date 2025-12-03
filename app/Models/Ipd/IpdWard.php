<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IpdWard extends Model
{
    protected $guarded = ['id'];

    public function rooms(): HasMany
    {
        return $this->hasMany(IpdRoom::class);
    }
}