<?php

namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;

class IpdBedCharge extends Model
{
    protected $table = 'ipd_bed_charges';
    
    protected $guarded = []; // Allow mass assignment

    protected $casts = [
        'charge_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Link back to the admission record.
     */
    public function admission()
    {
        return $this->belongsTo(IpdAdmission::class, 'ipd_admission_id');
    }
}