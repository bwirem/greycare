<?php

namespace App\Models\Patient;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientBillingSubgroup extends Model
{
    protected $table = 'patient_billing_subgroups';

    protected $fillable = [
        'name',
        'code',
        'billinggroup_id',
        'description'
    ];

    public $timestamps = true;

    public function group()
    {
        return $this->belongsTo(
            PatientBillingGroup::class,
            'billinggroup_id'
        );
    }
}