<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;

use App\Models\Inventory\SIV_Product;

class BLSItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bls_items';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [
        'itemgroup_id',  
        'name', 
        'price1',                   
        'price2',                         
        'price3',                             
        'price4', 
        'defaultqty',                
        'addtocart', 
        'product_id',       
    ];

    public function itemgroup()
    {
        return $this->belongsTo(BLSItemGroup::class, 'itemgroup_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }   


}