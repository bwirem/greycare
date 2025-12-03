<?php

namespace App\Models\Patient;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientBillingGroup extends Model
{
    protected $guarded = ['id'];

    public function subgroups(): HasMany
    {
        return $this->hasMany(PatientBillingSubgroup::class, 'billinggroup_id');
    }
}