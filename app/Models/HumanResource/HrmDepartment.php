<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmDepartment extends Model
{
    use HasFactory;

    protected $table = 'hrm_departments';

    protected $fillable = [
        'code',
        'name',
        'description',
    ];

    // Relationship: A department has many job assignments
    public function jobs()
    {
        return $this->hasMany(HrmEmployeeJob::class, 'department_id');
    }
}