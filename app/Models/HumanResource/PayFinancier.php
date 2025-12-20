<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayFinancier extends Model
{
    use HasFactory;

    protected $table = 'pay_financiers';

    protected $fillable = [
        'code',
        'name',
        'contact_info',
    ];

    // Relationship: A financier provides many loans
    public function loans()
    {
        return $this->hasMany(PayEmployeeLoan::class, 'financier_id');
    }
}