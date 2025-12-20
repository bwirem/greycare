<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaySocialSecurityType extends Model
{
    use HasFactory;

    protected $table = 'pay_social_security_types';

    protected $fillable = [
        'code',
        'name',
        'employee_rate',
        'employer_rate',
        'max_deductible_amount',
    ];

    protected $casts = [
        'employee_rate' => 'decimal:2',
        'employer_rate' => 'decimal:2',
        'max_deductible_amount' => 'decimal:2',
    ];
}