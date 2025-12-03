<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IpdRoom extends Model
{
    protected $guarded = ['id'];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(IpdWard::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(IpdBed::class);
    }
}