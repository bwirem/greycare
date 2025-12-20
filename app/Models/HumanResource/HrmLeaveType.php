<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmLeaveType extends Model
{
    use HasFactory;
    
    protected $table = 'hrm_leave_types';
    protected $fillable = ['name', 'days_per_year', 'description'];
}