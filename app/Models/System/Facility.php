<?php

namespace App\Models\System;

use App\Models\Inventory\IVInterFacilityTransfer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * By default, Laravel looks for 'facilities', but it's good practice to define it.
     */
    protected $table = 'facilities';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'location',
        'contact_number',
        'email',
        'is_active',
    ];

    /**
     * Relationship: A facility can receive many inter-facility transfers.
     */
    public function incomingTransfers()
    {
        return $this->hasMany(IVInterFacilityTransfer::class, 'destination_facility_id', 'id');
    }
}