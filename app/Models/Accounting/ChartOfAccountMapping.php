<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class ChartOfAccountMapping extends Model
{
    use HasFactory, SoftDeletes; 

    protected $fillable = [
        'account_payable_id', 'account_receivable_id'
    ];    
    
}


