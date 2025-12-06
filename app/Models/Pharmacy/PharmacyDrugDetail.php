<?php

namespace App\Models\Pharmacy;

use Illuminate\Database\Eloquent\Model;
use App\Models\SIV_Product; 

class PharmacyDrugDetail extends Model
{
    protected $table = 'pharmacy_drug_details';
    protected $guarded = [];

    /**
     * Get the parent inventory product.
     */
    public function product()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id');
    }
}