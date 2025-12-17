<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\PatientBillingGroup;

class BlsNhifPackage extends Model
{
    protected $guarded = [];

    public function group()
    {
        return $this->belongsTo(PatientBillingGroup::class, 'billing_group_id');
    }
}