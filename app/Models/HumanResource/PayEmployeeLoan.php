<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayEmployeeLoan extends Model
{
    use HasFactory;

    protected $table = 'pay_employee_loans';

    protected $fillable = [
        'employee_id',
        'financier_id', // Nullable (if Company Loan)
        'loan_reference',
        'principal_amount',
        'monthly_installment',
        'interest_rate',
        'current_balance',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:2',
        'monthly_installment' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(HrmEmployee::class, 'employee_id');
    }

    public function financier()
    {
        return $this->belongsTo(PayFinancier::class, 'financier_id');
    }
}