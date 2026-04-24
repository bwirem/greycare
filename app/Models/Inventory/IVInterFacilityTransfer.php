<?php

namespace App\Models\Inventory;

use App\Models\System\Facility; // Ensure this matches your actual Facility model location
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IVInterFacilityTransfer extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'iv_interfacilitytransfers';

    protected $fillable = [
        'transdate', 
        'source_store_id',
        'destination_facility_id',
        'stage',
        'restore_stage', 
        'total', 
        'remarks',
        'user_id'
    ];

    public function transferitems()
    {        
        return $this->hasMany(IVInterFacilityTransferItem::class, 'inter_facility_transfer_id', 'id');                  
    }
    
    public function sourceStore()
    {
        return $this->belongsTo(SIV_Store::class, 'source_store_id', 'id');
    }

    public function destinationFacility()
    {
        return $this->belongsTo(Facility::class, 'destination_facility_id', 'id');
    }

    /**
     * Calculate the total price of the transfer based on transfer items.
     *
     * @return float
     */
    public function calculateTotal()
    {
        return $this->transferitems->sum(function ($transferItem) {
            return $transferItem->totalPrice(); 
        });
    }

    /**
     * Automatically set the total attribute when saving the transfer.
     */
    public static function booted()
    {
        static::saving(function ($transfer) {
            $transfer->total = $transfer->calculateTotal();
        });
    }
}