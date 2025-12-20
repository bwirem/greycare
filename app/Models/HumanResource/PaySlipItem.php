<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaySlipItem extends Model
{
    use HasFactory;

    protected $table = 'pay_slip_items';

    protected $fillable = [
        'pay_slip_id',
        'name',   // e.g. "Housing Allowance", "NSSF"
        'type',   // Earning, Deduction, Tax
        'amount',
        'is_taxable',
        'loan_id', // Reference to loan if this is a loan deduction
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_taxable' => 'boolean',
    ];

    public function slip()
    {
        return $this->belongsTo(PaySlip::class, 'pay_slip_id');
    }
}