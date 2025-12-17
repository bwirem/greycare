<?php

namespace App\Models\Patient;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientBillingGroup extends Model
{
    protected $guarded = [];// Allow mass assignment for all fields

    protected $casts = [
        'isinsurance' => 'boolean',
        'hasceiling' => 'boolean',
        'hasid' => 'boolean',
        'inactive' => 'boolean',
        'isdefault' => 'boolean',
        'isexemption' => 'boolean',
    ];

    public function subgroups(): HasMany
    {
        return $this->hasMany(PatientBillingSubgroup::class, 'billinggroup_id');
    }
}