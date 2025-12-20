<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmPosition extends Model
{
    use HasFactory;

    protected $table = 'hrm_positions';

    protected $fillable = [
        'code',
        'title',
        'description',
    ];

    // Relationship: A position is held by many employees
    public function jobs()
    {
        return $this->hasMany(HrmEmployeeJob::class, 'position_id');
    }
}