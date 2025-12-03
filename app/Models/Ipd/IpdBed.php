<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpdBed extends Model
{
    protected $guarded = ['id'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(IpdRoom::class);
    }
}