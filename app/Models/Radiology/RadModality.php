<?php

namespace App\Models\Radiology;

use Illuminate\Database\Eloquent\Model;

class RadModality extends Model
{
    protected $table = 'rad_modalities';
    protected $guarded = [];

    public function procedures()
    {
        return $this->hasMany(RadProcedure::class, 'rad_modality_id');
    }
}