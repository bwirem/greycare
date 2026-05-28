<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IVReceiveItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'iv_receiveitems';

    protected $fillable = ['receive_id', 'product_id','expirydate', 'butchno', 'quantity','price'];

    public function receive()
    {
        return $this->belongsTo(IVReceive::class, 'receive_id', 'id');
    }

    public function item()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }

}