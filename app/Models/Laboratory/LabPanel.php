<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;
use App\Models\Billing\BLSItem;

class LabPanel extends Model
{
    protected $table = 'lab_panels';
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(LabCategory::class, 'lab_category_id');
    }

    public function parameters()
    {
        return $this->hasMany(LabTestParameter::class, 'lab_panel_id')->orderBy('sort_order');
    }

    public function defaultSample()
    {
        return $this->belongsTo(LabNatureOfSample::class, 'lab_nature_of_sample_id');
    }

    public function blsItem()
    {
        return $this->hasOne(BLSItem::class, 'lab_panel_id');
    }
}