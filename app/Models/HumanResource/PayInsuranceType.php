<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayInsuranceType extends Model
{
    use HasFactory;

    protected $table = 'pay_insurance_types';

    protected $fillable = [
        'code',
        'name',
        'rate',
        'fixed_amount',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
    ];
}