<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmEmployeeContact extends Model
{
    use HasFactory;

    protected $table = 'hrm_employee_contacts';

    protected $fillable = [
        'employee_id',
        'name',
        'relationship',
        'phone_number',
        'is_next_of_kin',
    ];

    protected $casts = [
        'is_next_of_kin' => 'boolean',
    ];
}