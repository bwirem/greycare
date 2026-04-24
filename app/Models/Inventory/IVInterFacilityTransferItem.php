<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IVInterFacilityTransferItem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'iv_interfacilitytransferitems';

    protected $fillable = [
        'inter_facility_transfer_id', 
        'product_id', 
        'quantity',
        'price'
    ];

    public function transfer()
    {
        return $this->belongsTo(IVInterFacilityTransfer::class, 'inter_facility_transfer_id', 'id');
    }

    public function item()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }

    /**
     * Calculate the total price for this transfer item.
     * 
     * @return float
     */
    public function totalPrice()
    {
        return $this->quantity * $this->price;
    }
}