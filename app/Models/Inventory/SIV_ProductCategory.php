<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;

class SIV_ProductCategory extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'siv_productcategories';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [      
        'name',         
    ];
}