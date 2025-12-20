<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmEmployeeJob extends Model
{
    use HasFactory;

    protected $table = 'hrm_employee_jobs';

    protected $fillable = [
        'employee_id',
        'department_id',
        'position_id',
        'hire_date',
        'contract_end_date',
        'basic_salary',
        'employment_type', // Full-time, Contract
        'social_security_number', // NSSF
        'insurance_number',       // NHIF
        'tax_identification_number', // KRA PIN
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'hire_date' => 'date',
        'contract_end_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(HrmEmployee::class, 'employee_id');
    }

    public function department()
    {
        return $this->belongsTo(HrmDepartment::class, 'department_id');
    }

    public function position()
    {
        return $this->belongsTo(HrmPosition::class, 'position_id');
    }
}