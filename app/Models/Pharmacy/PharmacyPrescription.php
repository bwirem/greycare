<?php

namespace App\Models\Pharmacy;

use Illuminate\Database\Eloquent\Model;
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdAdmission;
use App\Models\Patient\Patient;
use App\Models\User;
use App\Models\SIV_Product;

class PharmacyPrescription extends Model
{
    protected $table = 'pharmacy_prescriptions';
    protected $guarded = [];

    // --- Context Relationships ---

    public function visit()
    {
        return $this->belongsTo(OpdBooking::class, 'opd_booking_id');
    }

    public function admission()
    {
        return $this->belongsTo(IpdAdmission::class, 'ipd_admission_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    // --- Clinical Relationships ---

    /**
     * The Drug ordered (Links to Inventory Product)
     */
    public function product()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_user_id');
    }
    public function pharmacist()
    {
        return $this->belongsTo(User::class, 'pharmacist_user_id');
    }

    /**
     * Get the dispensations (issues) for this prescription.
     */
    public function dispensations()
    {
        return $this->hasMany(PharmacyDispensation::class, 'pharmacy_prescription_id');
    }

}



   