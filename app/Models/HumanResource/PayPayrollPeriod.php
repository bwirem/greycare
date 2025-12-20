<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayPayrollPeriod extends Model
{
    use HasFactory;

    protected $table = 'pay_payroll_periods';

    protected $fillable = [
        'code',       // e.g. 2025-01
        'name',       // e.g. January 2025
        'start_date',
        'end_date',
        'pay_date',
        'status',     // Draft, Processing, Approved, Paid
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'pay_date' => 'date',
    ];

    public function slips()
    {
        return $this->hasMany(PaySlip::class, 'payroll_period_id');
    }
}