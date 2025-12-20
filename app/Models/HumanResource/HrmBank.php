<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmBank extends Model
{
    use HasFactory;

    protected $table = 'hrm_banks';

    protected $fillable = [
        'code',
        'name',
    ];

    // Relationship: A bank is used by many employees
    public function employeeBanking()
    {
        return $this->hasMany(HrmEmployeeBanking::class, 'bank_id');
    }
}