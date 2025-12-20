<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmEmployee extends Model
{
    use HasFactory;

    protected $table = 'hrm_employees';

    protected $fillable = [
        'employee_code',
        'first_name',
        'last_name',
        'other_names',
        'gender',
        'date_of_birth',
        'national_id',
        'phone_number',
        'email',
        'address',
        'marital_status',
        'photo_path',
        'status', // Active, Terminated, etc.
    ];

    // --- Relationships ---

    // 1. Jobs (History and Current)
    public function jobs()
    {
        return $this->hasMany(HrmEmployeeJob::class, 'employee_id');
    }

    // Helper: Get the latest/active job
    public function currentJob()
    {
        return $this->hasOne(HrmEmployeeJob::class, 'employee_id')->latestOfMany();
    }

    // 2. Banking Details
    public function banking()
    {
        return $this->hasMany(HrmEmployeeBanking::class, 'employee_id');
    }

    // 3. Emergency Contacts
    public function contacts()
    {
        return $this->hasMany(HrmEmployeeContact::class, 'employee_id');
    }

    // 4. Attendance Records
    public function attendance()
    {
        return $this->hasMany(HrmAttendance::class, 'employee_id');
    }

    // 5. Loans
    public function loans()
    {
        return $this->hasMany(PayEmployeeLoan::class, 'employee_id');
    }
}