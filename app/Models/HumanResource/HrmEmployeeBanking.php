<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrmEmployeeBanking extends Model
{
    use HasFactory;

    protected $table = 'hrm_employee_banking';

    protected $fillable = [
        'employee_id',
        'bank_id',
        'branch_name',
        'account_number',
        'account_name',
    ];

    public function employee()
    {
        return $this->belongsTo(HrmEmployee::class, 'employee_id');
    }

    public function bank()
    {
        return $this->belongsTo(HrmBank::class, 'bank_id');
    }
}