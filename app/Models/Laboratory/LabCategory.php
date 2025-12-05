<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;

class LabCategory extends Model
{
    protected $table = 'lab_categories';
    protected $guarded = [];

    public function panels()
    {
        return $this->hasMany(LabPanel::class, 'lab_category_id');
    }
}