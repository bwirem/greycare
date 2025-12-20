<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmLeaveRequest extends Model
{
    use HasFactory;

    protected $table = 'hrm_leave_requests';

    protected $fillable = [
        'employee_id', 'leave_type_id', 'start_date', 'end_date', 
        'days_requested', 'return_date', 'reason', 
        'status', 'admin_remarks', 'approved_by'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'return_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(HrmEmployee::class, 'employee_id');
    }

    public function leaveType()
    {
        return $this->belongsTo(HrmLeaveType::class, 'leave_type_id');
    }
}