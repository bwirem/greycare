<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Inventory\SIV_Product;

class PROTenderItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pro_tenderitems';

    protected $fillable = ['tender_id', 'product_id', 'quantity'];

    public function tender()
    {
        return $this->belongsTo(PROTender::class, 'tender_id', 'id');
    }

    public function item()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }
   
}