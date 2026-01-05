<?php

namespace App\Models\Nursing;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Pharmacy\PharmacyPrescription;

class NursingMedicationAdministration extends Model
{
    protected $guarded = [];

    protected $casts = [
        'administered_at' => 'datetime',
    ];

    public function prescription()
    {
        return $this->belongsTo(PharmacyPrescription::class, 'pharmacy_prescription_id');
    }

    public function nurse()
    {
        return $this->belongsTo(User::class, 'nurse_user_id');
    }
}