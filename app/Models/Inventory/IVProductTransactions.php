<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IVProductTransactions extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'iv_producttransactions';

    /**
     * Initialize the model and dynamically set fillable attributes.
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // Define base non-dynamic columns
        $fillable = [
            'transdate',
            'sourcecode',
            'sourcedescription',
            'product_id',
            'expirydate',
            'reference',
            'transprice',
            'transtype',
            'transdescription',
            'user_id',
        ];

        // Dynamically add qtyin_1...20 and qtyout_1...20
        for ($i = 1; $i <= 20; $i++) {
            $fillable[] = "qtyin_{$i}";
            $fillable[] = "qtyout_{$i}";
        }

        $this->fillable = $fillable;

        parent::__construct($attributes);
    }

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