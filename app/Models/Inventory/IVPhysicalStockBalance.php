<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;

class IVPhysicalStockBalance extends Model
{
    protected $table = 'iv_physicalstockbalances'; // Example table name
    public $timestamps = true; // Or false if you manually manage

    protected $fillable = [
        'transdate',
        'store_id',
        'product_id',
        'quantity',
    ];

    protected $casts = [
        'transdate' => 'date',
    ];
}