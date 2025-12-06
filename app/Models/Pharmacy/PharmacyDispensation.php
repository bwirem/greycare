<?php

namespace App\Models\Pharmacy;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class PharmacyDispensation extends Model
{
    protected $table = 'pharmacy_dispensations';
    protected $guarded = [];

    public function prescription()
    {
        return $this->belongsTo(PharmacyPrescription::class, 'pharmacy_prescription_id');
    }

    public function pharmacist()
    {
        return $this->belongsTo(User::class, 'pharmacist_user_id');
    }
}