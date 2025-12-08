<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IpdRoom extends Model
{
    // FIX: Use empty array
    protected $guarded = [];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(IpdWard::class, 'ward_id');
    }

    public function beds(): HasMany
    {
        return $this->hasMany(IpdBed::class, 'room_id');
    }
}