<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaySlip extends Model
{
    use HasFactory;

    protected $table = 'pay_slips';

    protected $fillable = [
        'payroll_period_id',
        'employee_id',
        // Snapshots to preserve history even if master data changes
        'job_title_snapshot',
        'department_snapshot',
        
        // Summaries
        'basic_salary',
        'total_allowances',
        'gross_salary',
        'taxable_income',
        'tax_amount',
        'total_deductions',
        'net_pay',
        
        'is_paid',
    ];

    protected $casts = [
        'gross_salary' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'is_paid' => 'boolean',
    ];

    public function payrollPeriod()
    {
        return $this->belongsTo(PayPayrollPeriod::class, 'payroll_period_id');
    }

    public function employee()
    {
        return $this->belongsTo(HrmEmployee::class, 'employee_id');
    }

    public function items()
    {
        return $this->hasMany(PaySlipItem::class, 'pay_slip_id');
    }
}