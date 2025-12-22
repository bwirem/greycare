<?php

namespace App\Models\Radiology;

use Illuminate\Database\Eloquent\Model;
use App\Models\Billing\BLSItem;

class RadProcedure extends Model
{
    protected $table = 'rad_procedures';
    protected $guarded = [];

    public function modality()
    {
        return $this->belongsTo(RadModality::class, 'rad_modality_id');
    }

    public function blsItem()
    {
        return $this->hasOne(BLSItem::class, 'rad_procedure_id');
    }
}