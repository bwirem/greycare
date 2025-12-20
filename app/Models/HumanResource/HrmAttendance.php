<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmAttendance extends Model
{
    use HasFactory;

    protected $table = 'hrm_attendance';

    protected $fillable = [
        'employee_id',
        'attendance_date',
        'clock_in',
        'clock_out',
        'hours_worked',
        'status', // Present, Absent, Late, etc.
        'remarks',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
        'hours_worked' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(HrmEmployee::class, 'employee_id');
    }
}