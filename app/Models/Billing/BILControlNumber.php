<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class BILControlNumber extends Model
{
    use HasFactory;

    /**
     * Explicitly define the table name to avoid Laravel's snake_casing 
     * causing issues with the capitalized "BIL" prefix.
     */
    protected $table = 'bil_control_numbers';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable =[
        'transdate',
        'patient_code',
        'patient_name',
        'payment_reference',
        'controlno',
        'amount',
        'paymentdescription',
        'numberstatus',
        'transaction_ref',
        'receipt_no',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts =[
        'transdate' => 'datetime',
        'amount'    => 'decimal:2',
    ];

    /**
     * Relationship: A control number is generated/verified by a User.
     * Required for: `BILControlNumber::with(['user'])` in the Controller's index method.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}