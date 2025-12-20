<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayTaxBracket extends Model
{
    use HasFactory;

    protected $table = 'pay_tax_brackets';

    protected $fillable = [
        'lower_limit',
        'upper_limit',
        'rate',
        'fixed_amount',
        'is_active',
    ];

    protected $casts = [
        'lower_limit' => 'decimal:2',
        'upper_limit' => 'decimal:2',
        'rate' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}