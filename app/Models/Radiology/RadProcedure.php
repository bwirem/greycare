<?php

namespace App\Models\Radiology;

use Illuminate\Database\Eloquent\Model;

class RadProcedure extends Model
{
    protected $table = 'rad_procedures';
    protected $guarded = [];

    public function modality()
    {
        return $this->belongsTo(RadModality::class, 'rad_modality_id');
    }
}