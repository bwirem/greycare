<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IVProductControl extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'iv_productcontrol';
  

    protected $fillable = ['product_id','qty_1','qty_2','qty_3','qty_4','qty_5','qty_6','qty_7','qty_8','qty_9','qty_10'];

    public function product()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }
    
    
   
}
