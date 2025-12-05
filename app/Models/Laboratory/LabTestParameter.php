<?php

namespace App\Models\Laboratory;

use Illuminate\Database\Eloquent\Model;

class LabTestParameter extends Model
{
    protected $table = 'lab_test_parameters';
    protected $guarded = [];

    public function panel()
    {
        return $this->belongsTo(LabPanel::class, 'lab_panel_id');
    }

    public function ranges()
    {
        return $this->hasMany(LabParameterRange::class, 'lab_test_parameter_id');
    }

    public function dropdowns()
    {
        return $this->hasMany(LabParameterDropdown::class, 'lab_test_parameter_id');
    }
}