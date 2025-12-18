<?php

namespace App\Models\Expenses;

use Illuminate\Database\Eloquent\Model;

class SEXPItemGroup extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sexp_itemgroups';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [      
        'name',
    ];
}