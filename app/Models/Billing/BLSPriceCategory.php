<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;

class BLSPriceCategory extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bls_pricecategories';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [  
        'useprice1',         
        'useprice2',          
        'useprice3',            
        'useprice4', 
        'useprice5',            
        'useprice6',            
        'useprice7',            
        'useprice8',            
        'useprice9',            
        'useprice10',            
        'price1',            
        'price2',          
        'price3',               
        'price4',   
        'price5',            
        'price6',            
        'price7',            
        'price8',            
        'price9',            
        'price10',            
    ];
}