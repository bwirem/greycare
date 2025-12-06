<?php

namespace App\Models\BloodBank;

use Illuminate\Database\Eloquent\Model;

class BbComponentType extends Model
{
    protected $table = 'bb_component_types';
    protected $guarded = [];

    // Optional link to billing if you added bill_item_id in migration
    // public function billItem() { return $this->belongsTo(\App\Models\Billing\BillItem::class); }
}