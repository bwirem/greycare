<?php
namespace App\Models\Physiotherapy;

use Illuminate\Database\Eloquent\Model;

class PhyTreatmentType extends Model
{
    protected $table = 'phy_treatment_types';
    protected $fillable = ['name', 'code', 'description', 'is_active'];
}