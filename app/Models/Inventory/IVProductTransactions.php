<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Import for type hinting

class IVProductTransactions extends Model
{
    use HasFactory; // Added HasFactory trait

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'iv_producttransactions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transdate',
        'sourcecode',
        'sourcedescription',
        'product_id',
        'expirydate',
        'reference',
        'transprice',
        'transtype',
        'transdescription',
        'qtyin_1',
        'qtyout_1',
        'qtyin_2',
        'qtyout_2',
        'qtyin_3',
        'qtyout_3',
        'qtyin_4',
        'qtyout_4',
        'qtyin_5',
        'qtyout_5',
        'qtyin_6',
        'qtyout_6',
        'qtyin_7',
        'qtyout_7',
        'qtyin_8',
        'qtyout_8',
        'qtyin_9',
        'qtyout_9',
        'qtyin_10',
        'qtyout_10',
        'user_id', // Added user_id to fillable
    ];

     /**
     * Get the product that owns the transaction.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }
    
}
